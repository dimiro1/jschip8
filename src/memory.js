'use strict';

var MEM_SIZE = 0x1000;

/**
 * The main Memory
 */
function Memory() {
  this.memory = new Uint8Array(MEM_SIZE);
}

/**
 * Read a byte from memory
 */
Memory.prototype.read = function(addr) {
  return this.memory[addr];
}

/**
 * Read two bytes from memory
 */
Memory.prototype.readWord = function(addr) {
  return this.memory[addr] << 8 | this.memory[addr + 1];
}

/**
 * Write data to address specified in addr
 */
Memory.prototype.write = function(addr, data) {
  this.memory[addr] = data;
}

/**
 * Write two bytes in memory
 */
Memory.prototype.writeWord = function(addr, data) {
  this.write(addr, data >> 8);
  this.write(addr + 1, data & 0xFF);
}

module.exports = Memory;
