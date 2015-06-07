'use strict';

var Chip8 = require('../src/chip8').Chip8;
const Chip8Font = require('../src/chip8').Chip8Font;

// Only for testing purpuses
var dumbSound = {
  wasCalled: false,
  beep: function() {
    this.wasCalled = true;
  }
};

// Only for testing purpuses
var dumbGfx = {
  gfx: new Uint8Array(64 * 32),

  getPixel: function(x, y) {
    return this.gfx[this.i(x, y)];
  },

  setPixel: function(x, y) {
    this.gfx[this.i(x, y)] = 1;
  },

  getPixel: function(x, y) {
    return this.gfx[this.i(x, y)];
  },

  clearPixel: function(x, y) {
    this.gfx[this.i(x, y)] = 0;
  },

  cls: function() {
    for (var i = 0; i < (64 * 32); i++) {
      this.gfx[i] = 0;
    }
  },

  draw: function() {},

  i: function(x, y) {
    return x + y * 64;
  }
};

exports.testNewCpu = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);

  test.equal(0x200, chip8.pc);
  test.equal(0, chip8.i);
  test.equal(0, chip8.dt);
  test.equal(0, chip8.st);
  test.equal(false, chip8.shouldRedraw);

  for (var i = 0; i < Chip8Font.length; i++) {
    test.equal(chip8.memory.read(i), Chip8Font[i]);
  }

  for (var i = 0; i < 16; i++) {
    test.equal(chip8.keys[i], 0);
  }

  test.done();
}

exports.setKey = function(test) {
  var chip8 = new Chip8();
  test.equal(0, chip8.keys[0x0]);
  chip8.setKey(0x0);
  test.equal(1, chip8.keys[0x0]);

  test.equal(0, chip8.keys[0xF]);
  chip8.setKey(0xF);
  test.equal(1, chip8.keys[0xF]);

  test.done();
}

exports.testIncPc = function(test) {
  var chip8 = new Chip8();
  test.equal(0x200, chip8.pc);
  chip8.increment();
  test.equal(0x202, chip8.pc);

  test.done();
}

exports.testTimers = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);

  // with beep
  chip8.memory.writeWord(chip8.pc, 0x0E0);
  chip8.dt = 1;
  chip8.st = 1;

  test.equal(false, chip8.sound.wasCalled)

  chip8.step();

  test.equal(0, chip8.dt);
  test.equal(0, chip8.st);
  test.ok(chip8.sound.wasCalled);

  // no beep
  chip8.memory.writeWord(chip8.pc, 0x0E0);
  chip8.sound.wasCalled = false;
  chip8.st = 2;

  chip8.step();

  test.equal(false, chip8.sound.wasCalled);
  test.equal(1, chip8.st);

  test.done();
}

// 00E0 - CLS
exports.test00E0 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x00E0);

  chip8.gfx.setPixel(0, 0);
  chip8.step();

  test.equal(0, chip8.gfx.getPixel(0, 0));
  test.equal(0, chip8.gfx.getPixel(0, 1));

  test.done();
}

// 00EE - RET
exports.test00EE = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x00EE);

  chip8.stack.push(1);
  chip8.step();
  test.equal(1, chip8.pc);

  test.done();
}

exports.testPanic00 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x0000);

  test.throws(function() {
    chip8.step();
  });

  test.done();
}

// 1nnn - JP addr
exports.test1000 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x1FFF);
  chip8.step();

  test.equal(0x0FFF, chip8.pc);
  test.done();
}

// 2nnn - CALL addr
exports.test2000 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x2FFF);
  var oldPc = chip8.pc + 2;

  chip8.step();

  test.equal(oldPc, chip8.stack.pop());
  test.equal(0x0FFF, chip8.pc);
  test.done();
}

// 3xkk - SE Vx, byte
exports.test3000Equal = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x31FF);

  chip8.v[1] = 0xFF;
  var oldPc = chip8.pc + 4;

  chip8.step();

  test.equal(oldPc, chip8.pc);
  test.done();
}

// 3xkk - SE Vx, byte
exports.test3000NotEqual = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x31FF);

  chip8.v[1] = 0xAA;
  var oldPc = chip8.pc + 2;

  chip8.step();

  test.equal(oldPc, chip8.pc);
  test.done();
}

// 4xkk - SNE Vx, byte
exports.test4000Equal = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x41FF);

  chip8.v[1] = 0xFF;
  var oldPc = chip8.pc + 2;

  chip8.step();

  test.equal(oldPc, chip8.pc);
  test.done();
}

// 4xkk - SNE Vx, byte
exports.test4000NotEqual = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x41FF);

  chip8.v[1] = 0xAA;
  var oldPc = chip8.pc + 4;

  chip8.step();

  test.equal(oldPc, chip8.pc);
  test.done();
}

// 5xy0 - SE Vx, Vy
exports.test5000Equal = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x512F);

  chip8.v[1] = 0xFF;
  chip8.v[2] = 0xFF;

  var oldPc = chip8.pc + 4;

  chip8.step();

  test.equal(oldPc, chip8.pc);
  test.done();
}

// 5xy0 - SE Vx, Vy
exports.test5000NotEqual = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x512F);

  chip8.v[1] = 0xFF;
  chip8.v[2] = 0xAA;

  var oldPc = chip8.pc + 2;

  chip8.step();

  test.equal(oldPc, chip8.pc);
  test.done();
}

// 6xkk - LD Vx, byte
exports.test6000 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x61FF);

  chip8.step();

  test.equal(0xFF, chip8.v[1]);
  test.done();
}

// 7xkk - ADD Vx, byte
exports.test7000 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x7101);
  chip8.v[1] = 1;

  chip8.step();

  test.equal(2, chip8.v[1]);
  test.done();
}

// 8xy0 - LD Vx, Vy
exports.test8xy0 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x8120);

  chip8.v[1] = 1;
  chip8.v[2] = 0;

  test.equal(1, chip8.v[1]);
  test.equal(0, chip8.v[2]);

  chip8.step();

  test.equal(0, chip8.v[1]);
  test.equal(0, chip8.v[2]);

  test.done();
}

// 8xy1 - OR Vx, Vy
exports.test8xy1 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x8121);

  chip8.v[1] = 1;
  chip8.v[2] = 2;

  test.equal(1, chip8.v[1]);
  test.equal(2, chip8.v[2]);

  chip8.step();

  test.equal(1 | 2, chip8.v[1]);
  test.equal(2, chip8.v[2]);

  test.done();
}

// 8xy2 - AND Vx, Vy
exports.test8xy2 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x8122);

  chip8.v[1] = 1;
  chip8.v[2] = 2;

  test.equal(1, chip8.v[1]);
  test.equal(2, chip8.v[2]);

  chip8.step();

  test.equal(1 & 2, chip8.v[1]);
  test.equal(2, chip8.v[2]);

  test.done();
}

// 8xy3 - XOR Vx, Vy
exports.test8xy3 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x8123);

  chip8.v[1] = 1;
  chip8.v[2] = 2;

  test.equal(1, chip8.v[1]);
  test.equal(2, chip8.v[2]);

  chip8.step();

  test.equal(1 ^ 2, chip8.v[1]);
  test.equal(2, chip8.v[2]);

  test.done();
}

// 8xy4 - ADD Vx, Vy
exports.test8xy4Overflow = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x8124);

  chip8.v[1] = 0xFF;
  chip8.v[2] = 1;

  test.equal(0, chip8.v[0xF]);

  chip8.step();

  test.equal(0, chip8.v[1]);
  test.equal(1, chip8.v[0xF]);

  test.done();
}

// 8xy4 - ADD Vx, Vy
exports.test8xy4NotOverflow = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x8124);

  chip8.v[1] = 0xF0;
  chip8.v[2] = 1;

  test.equal(0, chip8.v[0xF]);

  chip8.step();

  test.equal(0xF0 + 1, chip8.v[1]);
  test.equal(0, chip8.v[0xF]);

  test.done();
}

// 8xy5 - SUB Vx, Vy
exports.test8xy5Greater = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x8125);

  chip8.v[1] = 2;
  chip8.v[2] = 1;

  test.equal(0, chip8.v[0xF]);

  chip8.step();

  test.equal(1, chip8.v[1]);
  test.equal(1, chip8.v[0xF]);

  test.done();
}

// 8xy5 - SUB Vx, Vy
exports.test8xy5NotGreater = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x8125);

  chip8.v[1] = 1;
  chip8.v[2] = 2;

  test.equal(0, chip8.v[0xF]);

  chip8.step();

  test.equal(0xFF, chip8.v[1]);
  test.equal(0, chip8.v[0xF]);

  test.done();
}


// 8xy6 - SHR Vx {, Vy}
exports.test8xy6 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x8126);

  chip8.v[1] = 1;

  chip8.step();
  test.equal(0, chip8.v[1]); // 1 / 2 == 0.5 => 0
  test.equal(1 & 0x0001, chip8.v[0xF]);

  test.done();
}

// 8xy7 - SUBN Vx, Vy
exports.test8xy7Greater = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x8127);
  chip8.v[1] = 1;
  chip8.v[2] = 2;
  test.equal(0, chip8.v[0xF]);
  chip8.step();
  test.equal(1, chip8.v[1]);
  test.equal(1, chip8.v[0xF]);
  test.done();
}

// 8xy7 - SUBN Vx, Vy
exports.test8xy7NotGreater = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x8127);
  chip8.v[1] = 2;
  chip8.v[2] = 1;
  test.equal(0, chip8.v[0xF]);
  chip8.step();
  test.equal(0xFF, chip8.v[1]);
  test.equal(0, chip8.v[0xF]);
  test.done();
}

// 8xyE - SHL Vx {, Vy}
exports.test8xyE = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x812E);
  chip8.v[1] = 1;
  chip8.step();
  test.equal(1 * 2, chip8.v[1]);
  test.equal(1 & 0x80, chip8.v[0xF]);
  test.done();
}

exports.testPanic8x = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x800F);

  test.throws(function() {
    chip8.step();
  });

  test.done();
}

// 9xy0 - SNE Vx, Vy
exports.test9xy0Equal = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x9120);
  chip8.v[1] = 1;
  chip8.v[2] = 1;

  var oldPC = chip8.pc;

  chip8.step();

  test.equal(oldPC + 2, chip8.pc);

  test.done();
}
// 9xy0 - SNE Vx, Vy
exports.test9xy0NotEqual = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0x9120);
  chip8.v[1] = 1;
  chip8.v[2] = 2;

  var oldPC = chip8.pc;

  chip8.step();

  test.equal(oldPC + 4, chip8.pc);

  test.done();
}

// Annn - LD I, addr
exports.testA000 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0xAFFF);

  chip8.step();

  test.equal(0xFFF, chip8.i);

  test.done();
}
// Bnnn - JP V0, addr
exports.testB000 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0xBFFF);
  chip8.v[0] = 1;
  chip8.step();

  test.equal(0xFFF + 1, chip8.pc);

  test.done();
}
// Cxkk - RND Vx, byte
exports.testC000 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0xC1FF);

  var oldRandom = Math.random; // Mocking random
  Math.random = function() {
    return 0.5;
  };

  chip8.step();

  Math.random = oldRandom; // Reverting Mock

  test.equal(127, chip8.v[1]);

  test.done();
}
// TODO: Dxyn - DRW Vx, Vy, nibble

// Ex9E - SKP Vx
exports.testEx9ETrue = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0xE19E);
  chip8.v[1] = 1;
  chip8.keys[1] = true;
  var oldPC = chip8.pc + 4;

  chip8.step();

  test.equal(oldPC, chip8.pc);

  test.done();
}

// Ex9E - SKP Vx
exports.testEx9EFalse = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0xE19E);
  chip8.v[1] = 1;
  chip8.keys[1] = false;
  var oldPC = chip8.pc + 2;

  chip8.step();

  test.equal(oldPC, chip8.pc);

  test.done();
}

// ExA1 - SKNP Vx
exports.testExA1True = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0xE1A1);
  chip8.v[1] = 1;
  chip8.keys[1] = true;
  var oldPC = chip8.pc + 2;

  chip8.step();

  test.equal(oldPC, chip8.pc);

  test.done();
}

// ExA1 - SKNP Vx
exports.testExA1False = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0xE1A1);
  chip8.v[1] = 1;
  chip8.keys[1] = false;
  var oldPC = chip8.pc + 4;

  chip8.step();

  test.equal(oldPC, chip8.pc);

  test.done();
}

exports.testPanicEx = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0xE002);

  test.throws(function() {
    chip8.step();
  });

  test.done();
}
// Fx07 - LD Vx, DT
exports.testFx07 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0xF107);
  chip8.v[1] = 1;
  chip8.dt = 2;

  chip8.step();

  test.equal(2, chip8.v[1]);

  test.done();
}

// TODO: Fx0A - LD Vx, K

// Fx15 - LD DT, Vx
exports.testFx15 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0xF115);
  chip8.v[1] = 10;
  chip8.dt = 2;

  chip8.step();

  test.equal(9, chip8.dt);

  test.done();
}

// Fx18 - LD ST, Vx
exports.testFx18 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0xF118);
  chip8.v[1] = 10;
  chip8.st = 2;

  chip8.step();

  test.equal(9, chip8.st);

  test.done();
}

// Fx1E - ADD I, Vx
exports.testFx1E = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0xF11E);
  chip8.v[1] = 1;
  chip8.i = 1;

  chip8.step();

  test.equal(2, chip8.i);

  test.done();
}

// Fx29 - LD F, Vx
exports.testFx29 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0xF129);
  chip8.v[1] = 2;
  chip8.i = 1;

  chip8.step();

  test.equal(2 * 5, chip8.i);

  test.done();
}

// Fx33 - LD B, Vx
exports.testFx33 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0xF133);
  chip8.v[1] = 0xFF;
  chip8.i = 3;

  chip8.step();

  test.equal(5, chip8.memory.read(chip8.i + 2)); // 5
  test.equal(5, chip8.memory.read(chip8.i + 1)); // 50
  test.equal(2, chip8.memory.read(chip8.i)); // 200

  test.done();
}

// Fx55 - LD [I], Vx
exports.testFx55 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0xF255);
  chip8.v[0] = 0xAA;
  chip8.v[1] = 0xBB;

  chip8.i = 0;

  chip8.step();

  test.equal(0xAA, chip8.memory.read(chip8.i));
  test.equal(0xBB, chip8.memory.read(chip8.i + 1));

  test.done();
}

// Fx65 - LD Vx, [I]
exports.testFx65 = function(test) {
  var chip8 = new Chip8(dumbGfx, dumbSound);
  chip8.memory.writeWord(chip8.pc, 0xF265);
  chip8.memory.write(chip8.i, 0xAA);
  chip8.memory.write(chip8.i + 1, 0xBB);

  chip8.i = 0;

  chip8.step();

  test.equal(0xAA, chip8.v[chip8.i]);
  test.equal(0xBB, chip8.v[chip8.i + 1]);

  test.done();
}
