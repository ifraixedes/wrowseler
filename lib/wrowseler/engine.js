'use strict';

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var uuid = require('uuid');

function Engine(opts) {
  EventEmitter.call(this);
  this.baseSequence = opts.sequence || [];
  this.runQueue = [];
  this.doneTasks = [];
  this.browser = opts.browser;
}

inherits(Engine, EventEmitter);

// @TODO Right now, only one task per time is supported, refactor to several
Engine.prototype.run = function (sequence) {
  var cycle;
  var args = [].slice.call(arguments, 1);

  if (0  < this.runQueue.length) {
    throw new Error('The engine is running one task. So far only one task can be executed a time');
  }

  cycle = new (getBrowserSequenceGenerator(this, this.baseSequence.concat(sequence)))(args);
  cycle.next();

  return this.runQueue[this.runQueue.length - 1].id;
};

function getBrowserSequenceGenerator(engine, sequence) {
  return function* (args) {
    var id = uuid.v4();
    var generator = this;
    engine.runQueue.push({
      id: id,
      generator: generator
    });

    for (let i = 0, step = sequence[i]; i < sequence.length; i++) {
      args.unshift(generator, engine.browser);
      args = yield step.apply(step, args);
    }

    engine.doneTasks.push(args);
    engine.runQueue.shift();
    engine.emit('task-done', {
      id: id,
      result: args
    });
  };
}


module.exports = Engine;
