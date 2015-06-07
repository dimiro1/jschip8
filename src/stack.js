'use strict';

var STACK_SIZE = 16;

/**
 * The Stack
 */
function Stack() {
  this.sp = 0;
  this.stack = new Uint16Array(STACK_SIZE);
}

/**
 * Pop values from Stack
 */
Stack.prototype.pop = function() {
  if (this.sp == 0) {
    throw new Error("Stack Underflow");
  }
  return this.stack[--this.sp];
}

/**
 * Push data into the Stack.
 */
Stack.prototype.push = function(data) {
  if (this.sp == STACK_SIZE) {
    throw new Error("Stack Overflow");
  }
  this.stack[this.sp++] = data;
}

module.exports = Stack;
