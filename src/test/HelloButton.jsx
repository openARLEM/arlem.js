import React from 'react';
import { render, unmountComponentAtNode } from 'react-dom';
import { act } from 'react-dom/test-utils';

import { assert } from 'chai';

import HelloButton from '../HelloButton.jsx';

let container = null;
beforeEach(() => {
  //console.log('beforeEach')
  container = document.createElement('div');
  document.body.appendChild(container);
});
afterEach(() => {
  //console.log('afterEach');
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

describe('<HelloButton />', function() {
  it('should render with textContent "Hello"', () => {
    act(() => {
      render(<HelloButton />, container);
    });
    assert.equal(container.textContent, "Hello");
  });
  it('should change to "Hello, World!" when clicked', () => {
    act(() => {
      render(<HelloButton />, container);
    });
    //console.log(container.outerHTML);
    const button = document.querySelector('button');
    act(() => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    //console.log(container.outerHTML);
    assert.equal(container.textContent, "Hello, World!");
  });
});
