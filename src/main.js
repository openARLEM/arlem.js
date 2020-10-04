import React from 'react';
import ReactDOM from 'react-dom';

import Validator from './Validator.jsx';

export default function (context) {
  const { domContainer, options } = context;

  ReactDOM.render(React.createElement(Validator, { options }), domContainer);
}
