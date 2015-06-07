'use strict';

var Memory = require('./memory');
var Stack = require('./stack');
var CanvasGfx = require('./gfx');

// Chip8 Fonts
var Chip8Font = [
  0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
  0x20, 0x60, 0x20, 0x20, 0x70, // 1
  0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
  0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
  0x90, 0x90, 0xF0, 0x10, 0x10, // 4
  0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
  0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
  0xF0, 0x10, 0x20, 0x40, 0x40, // 7
  0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
  0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
  0xF0, 0x90, 0xF0, 0x90, 0x90, // A
  0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
  0xF0, 0x80, 0x80, 0x80, 0xF0, // C
  0xE0, 0x90, 0x90, 0x90, 0xE0, // D
  0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
  0xF0, 0x80, 0xF0, 0x80, 0x80, // F
];

/**
 * The Chip8 implementation.
 */
function Chip8(gfx, sound) {
  // Registers v0 - vF
  this.v = new Uint8Array(16);
  // Program Counter
  this.pc = 0x200;

  // The program stack
  this.stack = new Stack();
  // Sound engine
  this.sound = sound;
  // Main Memory
  this.memory = new Memory();
  // Graphics engine
  this.gfx = gfx;
  // If the last inscruction was Render
  this.shouldRedraw = false;

  // Keyboard keys state
  this.keys = new Uint8Array(16);

  // Index
  this.i = 0;
  // Delay Timer
  this.dt = 0;
  // Sound Timer
  this.st = 0;

  this.running = true;

  // load font
  for (var i = 0; i < Chip8Font.length; i++) {
    this.memory.write(i, Chip8Font[i]);
  }
}

Chip8.prototype.setKey = function(key) {
  this.keys[key] = 1;
}

Chip8.prototype.resetKey = function(key) {
  this.keys[key] = 0;
}

/**
 * Load rom into memory.
 */
Chip8.prototype.loadRom = function(rom) {
  for (var i = 0; i < rom.length; i++) {
    this.memory.write(i + 0x200, rom[i]);
  }
}

/**
 * Increments the program counter.
 */
Chip8.prototype.increment = function() {
  this.pc += 2;
}

Chip8.prototype.updateTimers = function() {
  if (this.dt > 0) {
    this.dt--;
  }

  if (this.st > 0) {
    if (this.st == 1) {
      this.sound.beep();
    }
    this.st--;
  }
}

Chip8.prototype.decodeExecute = function(opcode) {
  var x = (opcode & 0x0F00) >> 8;
  var y = (opcode & 0x00F0) >> 4;

  this.increment();

  switch (opcode & 0xF000) {
    case 0x0000:
      switch (opcode) {
        case 0x00E0: // 00E0 - CLS
          this.gfx.cls();
          this.shouldRedraw = true;
          break;
        case 0x00EE: // 00EE - RET
          this.pc = this.stack.pop();
          break;
        default:
          throw new Error("Unknown opcode 0x" + opcode.toString(16).toUpperCase());
      }
      break;
    case 0x1000: // 1nnn - JP addr
      this.pc = opcode & 0x0FFF;
      break;
    case 0x2000: // 2nnn - CALL addr
      this.stack.push(this.pc);
      this.pc = opcode & 0x0FFF;
      break;
    case 0x3000: // 3xkk - SE Vx, byte
      var kk = opcode & 0x00FF;

      if (this.v[x] == kk) {
        this.increment();
      }
      break;
    case 0x4000: // 4xkk - SNE Vx, byte
      var kk = opcode & 0x00FF;

      if (this.v[x] != kk) {
        this.increment();
      }
      break;
    case 0x5000: // 5xy0 - SE Vx, Vy
      if (this.v[x] == this.v[y]) {
        this.increment();
      }
      break;
    case 0x6000: // 6xkk - LD Vx, byte
      kk = opcode & 0x00FF;
      this.v[x] = kk;
      break;
    case 0x7000: // 7xkk - ADD Vx, byte
      this.v[x] += (opcode & 0x00FF);
      break;
    case 0x8000:
      switch (opcode & 0x000F) {
        case 0x0000: // 8xy0 - LD Vx, Vy
          this.v[x] = this.v[y];
          break;
        case 0x0001: // 8xy1 - OR Vx, Vy
          this.v[x] |= this.v[y];
          break;
        case 0x0002: // 8xy2 - AND Vx, Vy
          this.v[x] &= this.v[y];
          break;
        case 0x0003: // 8xy2 - XOR Vx, Vy
          this.v[x] ^= this.v[y];
          break;
        case 0x0004: // 8xy4 - ADD Vx, Vy
          var r = this.v[x] + this.v[y];

          if (r > 0xFF) {
            this.v[0xF] = 1;
          } else {
            this.v[0xF] = 0;
          }

          this.v[x] = r;
          break;
        case 0x0005: // 8xy5 - SUB Vx, Vy
          if (this.v[x] > this.v[y]) {
            this.v[0xF] = 1;
          } else {
            this.v[0xF] = 0;
          }

          this.v[x] -= this.v[y];
          break;
        case 0x0006: // 8xy6 - SHR Vx {, Vy}
          this.v[0xF] = this.v[x] & 0x1;
          this.v[x] /= 2;
          break;
        case 0x0007: // 8xy7 - SUBN Vx, Vy
          if (this.v[y] > this.v[x]) {
            this.v[0xF] = 1;
          } else {
            this.v[0xF] = 0;
          }
          this.v[x] = this.v[y] - this.v[x];
          break;
        case 0x000E: // 8xyE - SHL Vx {, Vy}
          this.v[0xF] = this.v[x] & 0x80;
          this.v[x] = this.v[x] * 2;
          break;
        default:
          throw new Error("Unknown opcode 0x" + opcode.toString(16).toUpperCase());
      }
    case 0x9000: // 9xy0 - SNE Vx, Vy
      if (this.v[x] != this.v[y]) {
        this.increment();
      }
      break;
    case 0xA000: // Annn - LD I, addr
      this.i = opcode & 0x0FFF;
      break;
    case 0xB000: // Bnnn - JP V0, addr
      var addr = opcode & 0x0FFF;
      this.pc = addr + this.v[0];
      break;
    case 0xC000: // Cxkk - RND Vx, byte
      var rand = Math.floor(Math.random() * 0xFF);

      var kk = opcode & 0x00FF;
      this.v[x] = rand & kk;
      break;
    case 0xD000: // Dxyn - DRW Vx, Vy, nibble
      // Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision.
      var n = opcode & 0x000F;
      var rx = this.v[x];
      var ry = this.v[y];

      this.v[0xF] = 0;

      for (var i = 0; i < n; i++) {
        for (var j = 0; j < 8; j++) {
          var pixel = this.memory.read(this.i + i) >> (7 - j) & 1;
          var px = rx + j; // Position x
          var py = ry + i; // Position y

          // Test collision
          if (this.gfx.getPixel(px, py) == 1) {
            this.v[0xF] = 1;
          }

          // Draw with exclusive OR (XOR)
          // 1 ^ 1 = 0
          // 0 ^ 0 = 0
          // 1 ^ 0 = 1
          // 0 ^ 1 = 1
          if ((this.gfx.getPixel(px, py) ^ pixel) == 1) {
            this.gfx.setPixel(px, py);
          } else {
            this.gfx.clearPixel(px, py);
          }
        }
      }

      this.shouldRedraw = true;
      break;
    case 0xE000:
      switch (opcode & 0x000F) {
        case 0x000E: // Ex9E - SKP Vx
          if (this.keys[this.v[x]] == 1) {
            this.increment();
          }
          break;
        case 0x0001: // ExA1 - SKNP Vx
          if (this.keys[this.v[x]] == 0) {
            this.increment();
          }
          break;
        default:
          throw new Error("Unknown opcode 0x" + opcode.toString(16).toUpperCase());
      }
    case 0xF000:
      switch (opcode & 0x00FF) {
        case 0x0007: // Fx07 - LD Vx, DT
          this.v[x] = this.dt;
          break;
        case 0x000A: // Fx0A - LD Vx, K
          // Wait for a key press, store the value of the key in Vx.
          // All execution stops until a key is pressed, then the value of that key is stored in Vx.
          var oldKeyDown = this.setKey;
          var self = this;

          this.setKey = function(key) {
            self.v[x] = key;

            self.setKey = oldKeyDown.bind(self);
            self.setKey.apply(self, arguments);

            self.running = true;
          }

          this.running = false;
          break;
        case 0x0015: // Fx15 - LD DT, Vx
          this.dt = this.v[x];
          break;
        case 0x0018: // Fx18 - LD ST, Vx
          this.st = this.v[x];
          break;
        case 0x001E: // Fx1E - ADD I, Vx
          this.i += this.v[x];
          break;
        case 0x0029: // Fx29 - LD F, Vx
          this.i = this.v[x] * 5; // 5 is the number of rows per character.
          break;
        case 0x0033: // Fx33 - LD B, Vx
          this.memory.write(this.i, this.v[x] / 100);
          this.memory.write(this.i + 1, (this.v[x] / 10) % 10);
          this.memory.write(this.i + 2, (this.v[x] % 100) % 10);
          break;
        case 0x0055: // Fx55 - LD [I], Vx
          for (var i = 0; i <= x; i++) {
            this.memory.write(this.i + i, this.v[i])
          }
          break;
        case 0x0065: // Fx65 - LD Vx, [I]
          for (var i = 0; i <= x; i++) {
            this.v[i] = this.memory.read(this.i + i)
          }
          break;
      }
  }

  this.updateTimers();
}


Chip8.prototype.fetch = function() {
  return this.memory.readWord(this.pc);
}

/**
 * Step the cpu one instruction at a time
 */
Chip8.prototype.step = function() {
  var opcode = this.fetch();
  this.decodeExecute(opcode);
}

module.exports = {
  'Chip8': Chip8,
  'Chip8Font': Chip8Font
};
