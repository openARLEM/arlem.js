import React, { useEffect, useRef } from 'react';
import { Tabs, Tab } from 'react-bootstrap';

import activitySchema from './editor/activitySchema.json';
import activitySchemaRefs from './editor/activitySchemaRefs.json';
import activityExample from './editor/activityExample.json';
import workplaceSchema from './editor/workplaceSchema.json';
import workplaceSchemaRefs from './editor/workplaceSchemaRefs.json';
import workplaceExample from './editor/workplaceExample.json';
import { useState } from 'react';

export default function Validator() {
  const activityEditorContainerRef = useRef();
  const workplaceEditorContainerRef = useRef();
  const activityEditorRef = useRef();
  const workplaceEditorRef = useRef();
  const [results, setResults] = useState({ activity: [], workplace: [] });
  const [activityErrors, setActivityErrors] = useState([]);
  const [workplaceErrors, setWorkplaceErrors] = useState([]);

  useEffect(() => {
    const activityEditorContainer = activityEditorContainerRef.current;
    const workplaceEditorContainer = workplaceEditorContainerRef.current;

    // Load JSONEditor dynamically at runtime only when it is needed
    import('jsoneditor').then(JSONEditor => {
      JSONEditor = JSONEditor.default;
      const Ajv = JSONEditor.Ajv;

      const options = {
        mode: 'tree',
        modes: ['tree', 'view', 'form', 'code', 'text', 'preview']
      };
      const activityOptions = {
        ...options,
        schema: activitySchema,
        schemaRefs: activitySchemaRefs
      };
      const workplaceOptions = {
        ...options,
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
      activityEditor.set(activityExample);
      activityEditor.validate = activityValidator;
      activityEditorRef.current = activityEditor;
      let workplaceEditor = new JSONEditor(workplaceEditorContainer, workplaceOptions);
      workplaceEditor.set(workplaceExample);
      workplaceEditor.validate = workplaceValidator;
      workplaceEditorRef.current = workplaceEditor;
    });
  }, []); // empty deps array in order for this to run only once

  function validate() {
    const activityEditor = activityEditorRef.current;
    const workplaceEditor = workplaceEditorRef.current;
    let activity = activityEditor.get();
    let validActivity = activityEditor.validate(activity);
    if (!validActivity) {
      console.log(activityEditor.validate.errors);
      setActivityErrors(activityEditor.validate.errors);
    } else {
      setActivityErrors([]);
    }
    let workplace = workplaceEditor.get();
    let validWorkplace = workplaceEditor.validate(workplace);
    if (!validWorkplace) {
      console.log(workplaceEditor.validate.errors);
      setWorkplaceErrors(workplaceEditor.validate.errors);
    } else {
      setWorkplaceErrors([]);
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
          <input type="radio" id="customRadioInline1" name="customRadioInline" className="custom-control-input" checked
            onChange={event => { }} />
          <label className="custom-control-label" htmlFor="customRadioInline1">Activity and workplace models including cross-references</label>
        </div>
        <div className="custom-control custom-radio custom-control-inline">
          <input type="radio" id="customRadioInline2" name="customRadioInline" className="custom-control-input"
            onChange={event => { alert('TODO'); }} />
          <label className="custom-control-label" htmlFor="customRadioInline2">Activity model</label>
        </div>
        <div className="custom-control custom-radio custom-control-inline">
          <input type="radio" id="customRadioInline3" name="customRadioInline" className="custom-control-input"
            onChange={event => { alert('TODO'); }} />
          <label className="custom-control-label" htmlFor="customRadioInline3">Workplace model</label>
        </div>
        <button type="submit" className="btn btn-primary mb-2">Validate</button>
      </form>
      <div>
        <h3 style={{ display: activityErrors.length > 0 ? 'block' : 'none' }}>Activity</h3>
        {activityErrors.map((activityError, index) => (
          <div key={index}>{activityError.dataPath + ': ' + activityError.message}</div>
        ))}
      </div>
      <div>
        <h3 style={{ display: workplaceErrors.length > 0 ? 'block' : 'none' }}>Workplace</h3>
        {workplaceErrors.map((workplaceError, index) => (
          <div key={index}>{workplaceError.dataPath + ': ' + workplaceError.message}</div>
        ))}
      </div>
    </div>
  );
}
