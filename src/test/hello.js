import chai from 'chai';

import { world } from '../hello.js';

const { assert } = chai;

describe('hello', function() {
  describe('world()', function() {
    it('should return "Hello, World!"', () => {
      assert.equal(world(), "Hello, World!");
    });
  });
});
