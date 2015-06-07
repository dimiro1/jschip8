'use strict';

var Memory = require('../src/memory');

exports.testRead = function(test) {
    var memory = new Memory();
    memory.memory[0] = 1;
    memory.memory[1] = 1;

    test.equal(memory.read(0), memory.memory[0]);
    test.equal(memory.readWord(0), (memory.read(0) << 8 | memory.read(1)));

    test.done();
};

exports.testWrite = function(test) {
    var memory = new Memory();
    memory.memory[0] = 1;

    test.equal(memory.read(0), 1)
    memory.write(0, 2);
    test.equal(memory.read(0), 2)

    memory.writeWord(0, 0x00FF);
    test.equal(memory.read(0), 0x00);
    test.equal(memory.read(1), 0xFF);

    test.done();
};
