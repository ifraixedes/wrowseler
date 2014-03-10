'use strict';

var inherits = require('util').inherits;
var EventEmitter = require('events').EventEmitter;
var uuid = require('uuid');

function Engine(opts) {
  EventEmitter.call(this);
  this.baseSequence = opts.sequence || [];
  this.browser = opts.browser;
  this.runQueue = [];
  this.doneTasks = [];
}

inherits(Engine, EventEmitter);

// @TODO Right now, only one task per time is supported, refactor to several
Engine.prototype.run = function (sequence) {
  var taskId;
  var cycle;
  var args = [].slice.call(arguments, 1);
  var sequenceToExec = (sequence) ? this.baseSequence.concat(sequence) : this.baseSequence;

  if (0  < this.runQueue.length) {
    throw new Error('The engine is running one task. So far only one task can be executed a time');
  }

  cycle = new (getBrowserSequenceGenerator(this, sequenceToExec))(args);
  taskId = cycle.next().value.id;
  cycle.next();
  return taskId;
};

function getBrowserSequenceGenerator(engine, sequence) {
  return function* (args) {
    var id = uuid.v4();
    var generator = this;
    var task = {
      id: id,
      generator: generator
    };

    engine.runQueue.push(task);
    yield task;

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
