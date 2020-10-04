import React from 'react';

import { world } from './hello.js';

export default class HelloButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = { pushed: false };
  }

  render() {
    if (this.state.pushed) {
      return (
        <div className="hello">{ world() }</div>
      );
    } else {
      return (
        <button onClick={() => this.setState({ pushed: true })}>Hello</button>
      );
    }
  }
}
