import React, { useEffect, useRef } from 'react';
import { Tabs, Tab } from 'react-bootstrap';

import activitySchema from './editor/activitySchema.json';
import activitySchemaRefs from './editor/activitySchemaRefs.json';
import activityExample from './editor/activityExample.json';
import workplaceSchema from './editor/workplaceSchema.json';
import workplaceSchemaRefs from './editor/workplaceSchemaRefs.json';
import workplaceExample from './editor/workplaceExample.json';
import { useState } from 'react';

let Ajv = null; // To be assigned when loading JSONEditor

function getActivityValidator() {
  return Ajv({
    allErrors: true,
    verbose: true,
    jsonPointers: false,
    $data: true,
    schemaId: 'auto',
    schemas: activitySchemaRefs
  }).compile(activitySchema);
}

function getWorkplaceValidator() {
  return Ajv({
    allErrors: true,
    verbose: true,
    jsonPointers: false,
    $data: true,
    schemaId: 'auto',
    schemas: workplaceSchemaRefs
  }).compile(workplaceSchema);
}

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
      Ajv = JSONEditor.Ajv;

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

      let activityEditor = new JSONEditor(activityEditorContainer, activityOptions);
      activityEditorRef.current = activityEditor;
      let workplaceEditor = new JSONEditor(workplaceEditorContainer, workplaceOptions);
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
    let activity = null;
    if (validationType === 'all' || validationType === 'activity') {
      try {
        activity = activityEditor.get();
      } catch (error) {
        setActivityErrors([{ keyword: 'syntax', params: error }]);
      }
    } else {
      setActivityErrors(null);
    }
    if (activity) {    
      let validateActivity = getActivityValidator();
      let validActivity = validateActivity(activity);
      if (!validActivity) {
        //console.log(validateActivity.errors);
        setActivityErrors(validateActivity.errors);
      } else {
        setActivityErrors([]);
      }
    }

    // Workplace
    let workplace = null;
    if (validationType === 'all' || validationType === 'workplace') {
      try {
        workplace = workplaceEditor.get();
      } catch (error) {
        setWorkplaceErrors([{ keyword: 'syntax', params: error }]);
      }
    } else {
      setWorkplaceErrors(null);
    }
    if (workplace) {
      let validateWorkplace = getWorkplaceValidator();
      let validWorkplace = validateWorkplace(workplace);
      if (!validWorkplace) {
        //console.log(validateWorkplace.errors);
        setWorkplaceErrors(validateWorkplace.errors);
      } else {
        setWorkplaceErrors([]);
      }
    }

    if (activity && workplace && validationType === 'all') {
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
      const checkReferences = (current = {}, path, dataPath, property, types) => {
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
      {!activityErrors ? <></> :
        <div className="my-2">
          <h3><StatusIcon count={activityErrors.length} /> Activity: {activityErrors.length} error{activityErrors.length !== 1 ? 's' : ''}</h3>
          <ol>
            {activityErrors.map((activityError, index) => (
              <ValidationError key={index} error={activityError} modelName="Activity" />
            ))}
          </ol>
        </div>
      }
      {!workplaceErrors ? <></> :
        <div className="my-2">
          <h3><StatusIcon count={workplaceErrors.length} /> Workplace: {workplaceErrors.length} error{workplaceErrors.length !== 1 ? 's' : ''}</h3>
          <ol>
            {workplaceErrors.map((workplaceError, index) => (
              <ValidationError key={index} error={workplaceError} modelName="Workplace" />
            ))}
          </ol>
        </div>
      }
      {!referenceErrors ? <></> :
        <div className="my-2">
          <h3><StatusIcon count={referenceErrors.length} /> References: {referenceErrors.length} error{referenceErrors.length !== 1 ? 's' : ''}</h3>
          <ol>
            {referenceErrors.map((referenceError, index) => (
              <ValidationError key={index} error={referenceError} />
            ))}
          </ol>
        </div>
      }
    </div>
  ); sr
}

function ValidationError({ error, modelName = '' }) {
  let details, { params } = error;
  switch (error.keyword) {
    case 'syntax':
      details = <>JSON syntax error: <pre>{params.message}</pre></>;
      break;
    case 'required':
      details = <>Missing property, must be specified: <code>{params.missingProperty}</code></>;
      break;
    case 'additionalProperties':
      details = <>Non-standard property, shouldn't be specified: <code>{params.additionalProperty}</code></>;
      break;
    case 'enum':
      details = <>Invalid value, must be one of: {params.allowedValues.map((value, index) => (<>
        {index === 0 ? <></> : <>, </> }
        <code key={index}>{value}</code>
      </>))}</>;
      break;
    case 'format':
      details = <>Invalid value, must be formatted as: <code>{params.format}</code></>;
      break;
    case 'notFound':
      details = <>Reference <code>{params.objectId}</code> not found for property <code>{params.property}</code>,
        must be a reference to one of: {params.types.map((type, index) => (<>
        {index === 0 ? <></> : <>, </> }
        <code key={index}>{type}</code>
      </>))}</>;
      break;
    default:
      details = <>{error.keyword} ({JSON.stringify(error.params)});</>;
  }
  return (
    <li><em>{error.dataPath || modelName}:</em> {details}</li>
  );
}

function CircleFill() {
  return (
    // Source: https://icons.getbootstrap.com/icons/check-circle-fill/ (MIT license)
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
    </svg>
  );
}

function CheckCircleFill() {
  return (
    // Source: https://icons.getbootstrap.com/icons/check-circle-fill/ (MIT license)
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
    </svg>
  );
}

function XCircleFill() {
  return (
    // Source: https://icons.getbootstrap.com/icons/x-circle-fill/ (MIT license)
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-x-circle-fill" viewBox="0 0 16 16">
      <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z"/>
    </svg>
  );
}

function StatusIcon({ count }) {
 if (count === 0) {
   return (
    <span style={{ color: 'green' }}><CheckCircleFill /></span>
   );
 } else {
   return (
    <span style={{ color: 'red' }}><XCircleFill /></span>
   );
 }
}
