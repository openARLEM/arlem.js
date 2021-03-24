import React, { useEffect, useRef } from 'react';
import { Tabs, Tab } from 'react-bootstrap';

import activitySchema from './editor/activitySchema.json';
import activitySchemaRefs from './editor/activitySchemaRefs.json';
import activityExample from './editor/activityExample.json';
import workplaceSchema from './editor/workplaceSchema.json';
import workplaceSchemaRefs from './editor/workplaceSchemaRefs.json';
import workplaceExample from './editor/workplaceExample.json';
import { useState } from 'react';

export default function Validator({ options }) {
  const activityEditorContainerRef = useRef();
  const workplaceEditorContainerRef = useRef();
  const activityEditorRef = useRef();
  const workplaceEditorRef = useRef();
  const [validationType, setValidationType] = useState('all');
  const [activityErrors, setActivityErrors] = useState(null);
  const [workplaceErrors, setWorkplaceErrors] = useState(null);
  const [referenceErrors, setReferenceErrors] = useState(null);

  useEffect(() => {
    const activityEditorContainer = activityEditorContainerRef.current;
    const workplaceEditorContainer = workplaceEditorContainerRef.current;

    // Load JSONEditor dynamically at runtime only when it is needed
    import('jsoneditor').then(JSONEditor => {
      JSONEditor = JSONEditor.default;
      const Ajv = JSONEditor.Ajv;

      const editorOptions = {
        mode: 'tree',
        modes: ['tree', 'view', 'form', 'code', 'text', 'preview']
      };
      const activityOptions = {
        ...editorOptions,
        schema: activitySchema,
        schemaRefs: activitySchemaRefs
      };
      const workplaceOptions = {
        ...editorOptions,
        schema: workplaceSchema,
        schemaRefs: workplaceSchemaRefs
      };
      const activityValidator = Ajv({
        allErrors: true,
        verbose: true,
        jsonPointers: false,
        $data: true,
        schemaId: 'auto',
        schemas: activitySchemaRefs
      }).compile(activitySchema);
      const workplaceValidator = Ajv({
        allErrors: true,
        verbose: true,
        jsonPointers: false,
        $data: true,
        schemaId: 'auto',
        schemas: workplaceSchemaRefs
      }).compile(workplaceSchema);

      let activityEditor = new JSONEditor(activityEditorContainer, activityOptions);
      activityEditor.validate = activityValidator;
      activityEditorRef.current = activityEditor;
      let workplaceEditor = new JSONEditor(workplaceEditorContainer, workplaceOptions);
      workplaceEditor.validate = workplaceValidator;
      workplaceEditorRef.current = workplaceEditor;

      if (options.appActivity || options.appWorkplace) {
        if (options.appActivity) {
          fetch(options.appActivity)
            .then(response => response.json())
            .then(activityJson => {
              activityEditor.set(activityJson);
            });
        }
        if (options.appWorkplace) {
          fetch(options.appWorkplace)
            .then(response => response.json())
            .then(workplaceJson => {
              workplaceEditor.set(workplaceJson);
            });
        }
      } else {
        activityEditor.set(activityExample);
        workplaceEditor.set(workplaceExample);
      }
    });
  }, []); // empty deps array in order for this to run only once

  function validate() {
    const activityEditor = activityEditorRef.current;
    const workplaceEditor = workplaceEditorRef.current;

    // Activity
    let activity = activityEditor.get();
    if (validationType === 'all' || validationType === 'activity') {
      let validActivity = activityEditor.validate(activity);
      if (!validActivity) {
        console.log(activityEditor.validate.errors);
        setActivityErrors(activityEditor.validate.errors);
      } else {
        setActivityErrors([]);
      }
    } else {
      setActivityErrors(null);
    }

    // Workplace
    let workplace = workplaceEditor.get();
    if (validationType === 'all' || validationType === 'workplace') {
      let validWorkplace = workplaceEditor.validate(workplace);
      if (!validWorkplace) {
        console.log(workplaceEditor.validate.errors);
        setWorkplaceErrors(workplaceEditor.validate.errors);
      } else {
        setWorkplaceErrors([]);
      }
    } else {
      setWorkplaceErrors(null);
    }

    if (validationType === 'all') {
      // Analyze workplace
      const objectTypes = ['things', 'places', 'persons', 'sensors', 'devices', 'apps',
        'detectables', 'primitives', 'predicates', 'warnings'];
      let objectIds = objectTypes.reduce((aggr, objectType) => {
        aggr[objectType] = Array.isArray(workplace[objectType])
          ? workplace[objectType].map(obj => obj.id)
          : [];
        return aggr;
      }, {});

      // Cross-references
      const referenceTypes = [
        { path: ['actions'], property: 'device', types: ['devices'] },
        { path: ['actions'], property: 'location', types: ['places'] },
        { path: ['actions'], property: 'predicate', types: ['predicates'] },
        { path: ['actions', 'enter', 'activates'], property: 'target', types: ['things', 'places', 'persons'] },
        { path: ['actions', 'enter', 'activates'], property: 'augmentation', types: ['predicates', 'primitives', 'warnings'] }, // TODO actions
        { path: ['actions', 'enter', 'activates'], property: 'poi', types: ['things', 'places', 'persons'] }, // TODO Verify (only) these are tangible
        { path: ['actions', 'enter', 'deactivates'], property: 'target', types: ['things', 'places', 'persons'] },
        { path: ['actions', 'enter', 'deactivates'], property: 'augmentation', types: ['predicates', 'primitives', 'warnings'] }, // TODO actions, wildcard ('*')
        { path: ['actions', 'enter', 'deactivates'], property: 'poi', types: ['things', 'places', 'persons'] } // TODO Verify (only) these are tangible
      ];
      let referenceErrors = [];
      const checkReferences = (current, path, dataPath, property, types) => {
        if (path.length > 0) {
          let segment = path[0];
          let remaining = path.slice(1);
          if (Array.isArray(current[segment])) {
            current[segment].forEach((item, itemIndex) => {
              checkReferences(item, remaining,
                `${dataPath}.${segment}[${itemIndex}]`, property, types);
            });
          } else {
            checkReferences(current[segment], remaining,
              `${dataPath}.${segment}`, property, types);
          }
        } else if (current.hasOwnProperty(property)) {
          let objectId = current[property];
          let found = false;
          types.forEach(type => {
            if (objectIds[type].indexOf(objectId) !== -1) {
              found = true;
            }
          });
          if (!found) {
            referenceErrors.push({ dataPath, keyword: 'notFound', params: { property, objectId, types } });
          }
        }
      };
      referenceTypes.forEach(referenceType =>
        checkReferences(activity, referenceType.path, '', referenceType.property, referenceType.types));
      setReferenceErrors(referenceErrors);
    } else {
      setReferenceErrors(null);
    }
  }

  return (
    <div>
      <Tabs defaultActiveKey="activity" id="validatorEditorTabs">
        <Tab eventKey="activity" title="Activity">
          <div ref={activityEditorContainerRef} style={{ height: '60vh' }}></div>
        </Tab>
        <Tab eventKey="workplace" title="Workplace">
          <div ref={workplaceEditorContainerRef} style={{ height: '60vh' }}></div>
        </Tab>
      </Tabs>
      <form className="my-3" onSubmit={event => { event.preventDefault(); validate(); }}>
        <div className="custom-control-inline">Validation:</div>
        <div className="custom-control custom-radio custom-control-inline">
          <input type="radio" id="validationTypeAll" className="custom-control-input" checked
            onChange={event => { setValidationType('all'); }} checked={validationType === 'all'} />
          <label className="custom-control-label" htmlFor="validationTypeAll">Activity and workplace models including cross-references</label>
        </div>
        <div className="custom-control custom-radio custom-control-inline">
          <input type="radio" id="validationTypeActivity" className="custom-control-input"
            onChange={event => { setValidationType('activity'); }} checked={validationType === 'activity'} />
          <label className="custom-control-label" htmlFor="validationTypeActivity">Activity model</label>
        </div>
        <div className="custom-control custom-radio custom-control-inline">
          <input type="radio" id="validationTypeWorkplace" className="custom-control-input"
            onChange={event => { setValidationType('workplace'); }} checked={validationType === 'workplace'} />
          <label className="custom-control-label" htmlFor="validationTypeWorkplace">Workplace model</label>
        </div>
        <button type="submit" className="btn btn-primary mb-2">Validate</button>
      </form>
      {activityErrors === null ? <></> :
        <div className="my-2">
          <h3>Activity</h3>
          {activityErrors.map((activityError, index) => (
            <div key={index}>{activityError.dataPath}: {activityError.keyword} ({JSON.stringify(activityError.params)})</div>
          ))}
        </div>
      }
      {workplaceErrors === null ? <></> :
        <div className="my-2">
          <h3>Workplace</h3>
          {workplaceErrors.map((workplaceError, index) => (
            <div key={index}>{workplaceError.dataPath}: {workplaceError.keyword} ({JSON.stringify(workplaceError.params)})</div>
          ))}
        </div>
      }
      {referenceErrors === null ? <></> :
        <div className="my-2">
          <h3>References</h3>
          {referenceErrors.map((referenceError, index) => (
            <div key={index}>{referenceError.dataPath}: {referenceError.keyword} ({JSON.stringify(referenceError.params)})</div>
          ))}
        </div>
      }
    </div>
  );
}
