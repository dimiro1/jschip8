'use strict';

var WIDTH = 64;
var HEIGHT = 32;

/**
 * Each colorscheme is an array containing two hex numbers
 * The first is the background color and the second the foreground color.
 */
var COLORSCHEMES = {
  'blackwhite': [0x000000, 0xFFFFFF],
  'whiteblack': [0xFFFFFF, 0x000000],
  'dotmatrix': [0x9bbc0f, 0x0F380F],
  'redy': [0xFF0000, 0xFFFF00],
  'bgreen': [0x000000, 0x29FC2E],
  'gbp': [0x718376, 0x000000],
  'blueshades': [0x002030, 0xA1C1EE],
  'blu': [0x020181, 0x3AFBFE]
};

/**
 * The Graphics engine
 * Drawing to canvas.
 */
function CanvasGfx(canvas, scheme) {
  this.canvas = canvas;
  this.buffer = new Uint8Array(WIDTH * HEIGHT);
  this.context = this.canvas.getContext("2d");
  this.scheme = COLORSCHEMES[scheme];

  this.imageData = this.context.createImageData(WIDTH, HEIGHT);
}

CanvasGfx.prototype.draw = function() {

  for (var i = 0; i < (WIDTH * HEIGHT); i++) {
    var color = this.scheme[1];

    if (this.buffer[i] == 0) {
      color = this.scheme[0];
    }

    this.imageData.data[i * 4 + 0] = (color >> 16) & 0xFF;
    this.imageData.data[i * 4 + 1] = (color >> 8) & 0xFF;
    this.imageData.data[i * 4 + 2] = color & 0xFF;
    this.imageData.data[i * 4 + 3] = 0xFF;
  }

  this.context.putImageData(this.imageData, 0, 0);
}

CanvasGfx.prototype.getPixel = function(x, y) {
  return this.buffer[this.i(x, y)];
}

CanvasGfx.prototype.setPixel = function(x, y) {
  this.buffer[this.i(x, y)] = 1;
}

CanvasGfx.prototype.clearPixel = function(x, y) {
  this.buffer[this.i(x, y)] = 0;
}

CanvasGfx.prototype.cls = function() {
  for (var i = 0; i < (WIDTH * HEIGHT); i++) {
    this.buffer[i] = 0;
  }
}

CanvasGfx.prototype.i = function(x, y) {
  return x + y * WIDTH;
}

module.exports = CanvasGfx;
