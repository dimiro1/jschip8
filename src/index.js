'use strict';

var Chip8 = require('./chip8').Chip8;
var Gfx = require('./gfx');
var Sound = require('./sound');
var utils = require('./utils');

// Find the canvas element
var canvas = document.getElementById('screen');

// The graphics engine
var gfx = new Gfx(canvas, 'blu');

// The sound engine
var sound = new Sound();

// Creating an Chip8 emulator
var chip8 = new Chip8(gfx, sound);

// // Instructions per second
// var CHIP8_FREQUENCY = 60;
// // Monitor Update interval in HZ
// var MONITOR_REFRESH_RATE = 60;
// var INSTRUCTIONS_PER_STEP = Math.round(CHIP8_FREQUENCY / (1000 / MONITOR_REFRESH_RATE));

// Loading the game
utils.load('/roms/INVADERS', function(rom) {
  chip8.loadRom(new Uint8Array(rom));

  // The Game loop
  window.requestAnimationFrame(function frame() {
    for (var i = 0; i < 10; i++) {
      if (chip8.running) {
        chip8.step();
      }
    }

    if (chip8.shouldRedraw) {
      chip8.gfx.draw();
      chip8.shouldRedraw = false;
    }

    window.requestAnimationFrame(frame);
  });
});


// Keypad                   Keyboard
// +-+-+-+-+                +-+-+-+-+
// |1|2|3|C|                |1|2|3|4|
// +-+-+-+-+                +-+-+-+-+
// |4|5|6|D|                |Q|W|E|R|
// +-+-+-+-+       =>       +-+-+-+-+
// |7|8|9|E|                |A|S|D|F|
// +-+-+-+-+                +-+-+-+-+
// |A|0|B|F|                |Z|X|C|V|
// +-+-+-+-+                +-+-+-+-+
var KEY_MAPPING = {
  49: 0x1, // 1
  50: 0x2, // 2
  51: 0x3, // 2
  52: 0xC, // 4

  81: 0x4, // q
  87: 0x5, // w
  69: 0x6, // e
  82: 0xD, // r

  65: 0x7, // a
  83: 0x8, // s
  68: 0x9, // d
  70: 0xE, // f

  90: 0xA, // z
  88: 0x0, // x
  67: 0xB, // c
  86: 0xF // v
};

window.addEventListener('keydown', function(e) {
  chip8.setKey(KEY_MAPPING[e.keyCode]);
});

window.addEventListener('keyup', function(e) {
  chip8.resetKey(KEY_MAPPING[e.keyCode]);
});
