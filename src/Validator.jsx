import React, { useEffect, useRef } from 'react';
import { Tabs, Tab } from 'react-bootstrap';

import activitySchema from './editor/activitySchema.json';
import activityExample from './editor/activityExample.json';
import workplaceSchema from './editor/workplaceSchema.json';
import workplaceExample from './editor/workplaceExample.json';

export default function Validator() {
  const activityEditorRef = useRef();
  const workplaceEditorRef = useRef();

  useEffect(() => {
    const activityEditorContainer = activityEditorRef.current;
    const workplaceEditorContainer = workplaceEditorRef.current;

    // Load JSONEditor dynamically at runtime only when it is needed
    import('jsoneditor').then(JSONEditor => {
      JSONEditor = JSONEditor.default;

      const options = {
        mode: 'tree',
        modes: ['tree', 'view', 'form', 'code', 'text', 'preview']
      };
      const activityOptions = {
        ...options,
        schema: activitySchema
      };
      const workplaceOptions = {
        ...options,
        schema: workplaceSchema
      };

      let activityEditor = new JSONEditor(activityEditorContainer, activityOptions);
      activityEditor.set(activityExample);
      let workplaceEditor = new JSONEditor(workplaceEditorContainer, workplaceOptions);
      workplaceEditor.set(workplaceExample);
    });
  }, []); // empty deps array in order for this to run only once

  return (
    <Tabs defaultActiveKey="activity" id="validatorEditorTabs">
      <Tab eventKey="activity" title="Activity">
        <div ref={activityEditorRef} style={{ height: '70vh' }}></div>
      </Tab>
      <Tab eventKey="workplace" title="Workplace">
        <div ref={workplaceEditorRef} style={{ height: '70vh' }}></div>
      </Tab>
    </Tabs>
  );
}
