'use strict';

var Stack = require('../src/stack');

exports.testPushPop = function(test) {
  var stack = new Stack();
  stack.push(1);
  test.equal(1, stack.pop());

  test.done();
}

exports.testStackOverflow = function(test) {
  var stack = new Stack();

  for (var i = 0; i < 16; i++) {
    stack.push(1);
  }

  test.throws(function() {
    stack.push(1);
  });

  test.done();
}

exports.testStackUnderflow = function(test) {
  var stack = new Stack();

  test.throws(function() {
    stack.pop();
  });

  test.done();
}
