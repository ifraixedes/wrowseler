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
    var generator = this;
    var task = {
      id: uuid.v4(),
      generator: generator
    };
    var taskDone = { id: task.id };

    engine.runQueue.push(task);
    yield task;

    try {
      if (0 < sequence.length) {
        for (let i = 0, step = sequence[i]; i < sequence.length; i++) {
          if (undefined === args) {
            args = [];
          } else if (!args instanceof Array) {
            args = [args];
          }

          args.unshift(generator, engine.browser);
          /* jshint loopfunc: true */
          args = yield setImmediate(function () { step.apply(step, args); });
          /* jshint loopfunc: false */
        }

        taskDone.results = args;
      } else {
        taskDone.results = undefined;
      }
    } catch (error) {
      taskDone.error = error;
    } finally {
      engine.doneTasks.push(taskDone);
      engine.runQueue.shift();
      engine.emit('task-done', taskDone);
    }
  };
}


module.exports = Engine;
