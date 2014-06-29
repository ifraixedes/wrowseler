'use strict';

const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;
const _ = require('lodash');
const uuid = require('uuid');

const _clone = _.clone;

function gear(engine) {
  engine._internalEmitter.on(Engine.EVENT_TASK_DONE, function (taskDoneObj) {
    if (engine.status !== Engine.STATUS_OFF) {
      engine._run();
    }
  });
}

gear._changeEngineStatus = function (engine, status) {
  engine.status = status;
  engine.emit(Engine.EVENT_STATUS_CHANGED, { status: status });
};

gear.taskDone = function (engine, taskDoneObj) {
  engine._internalEmitter.emit(Engine.EVENT_TASK_DONE, taskDoneObj);
};

gear.runningTask = function (engine) {
  gear._changeEngineStatus(engine, Engine.STATUS_RUNNING_A_TASK);
};

gear.noPendingTasks = function (engine) {
  gear._changeEngineStatus(engine, Engine.STATUS_WAITING_TO_RUN_TASK);
};

gear.pushedNewTask = function (engine) {
  if (engine.status === Engine.STATUS_WAITING_TO_RUN_TASK) {
    engine._run();
  }
};

gear.switchOn = function (engine) {
  if (engine.status === Engine.STATUS_OFF) {
    gear._changeEngineStatus(engine, Engine.STATUS_WAITING_TO_RUN_TASK);
    engine._run();
  }
};

gear.switchOff = function (engine) {
  gear._changeEngineStatus(engine, Engine.STATUS_OFF);
};

/**
 * Engine constructor
 *
 * [Object] opts: Options object to setup Engine
 *      - Object browser: Webdriver browser instance.
 *      - [Array sequence]: Array with the steps to use as a base of
 *              every steps sequences run with this instance. This
 *              steps will be appended to the future sequences run.
 *              None appended by default.
 *      - [Boolean switchOn]: Boolean to specify if the engine is running
 *              automatically when a sequence is run (speedUp method) or
 *              is off and it has to be enabled to run the enqueued step
 *              engines
 */
function Engine(opts) {
  EventEmitter.call(this);
  this.baseSequence = opts.sequence || [];
  this.browser = opts.browser;
  this.runningQueue = [];
  this.status = (true === opts.switchOn) ? Engine.STATUS_WAITING_TO_RUN_TASK : Engine.STATUS_OFF;
  this._internalEmitter = new EventEmitter();

  gear(this);
}

inherits(Engine, EventEmitter);

Engine.EVENT_STATUS_CHANGED = '**_status-changed_**';
Engine.EVENT_ENQUEUED_TASK = '**_enqueued-task_**';
Engine.EVENT_STEP_SEQUENCE_STARTS = '**_step-sequence-starts_**';
Engine.EVENT_STEP_SEQUENCE_ENDS = '**_step-sequence-ends_**';
Engine.EVENT_TASK_DONE = '**_task-done_**';
Engine.STATUS_OFF = 'off';
Engine.STATUS_WAITING_TO_RUN_TASK = 'waiting-to-run-task';
Engine.STATUS_RUNNING_A_TASK = 'running-a-task';
Engine.TASK_STATUS_OK = 'ok';
Engine.TASK_STATUS_STOPPED = 'stopped';
Engine.TASK_STATUS_ERROR = 'error';

Engine.prototype.speedUp = function (sequence) {
  const args = [].slice.call(arguments, 1);
  const sequenceToExec = (sequence) ? this.baseSequence.concat(sequence) : this.baseSequence;
  var taskId;
  var cycle;

  cycle = getBrowserSequenceGenerator(this, sequenceToExec, args);
  taskId = cycle.next().value;
  this.runningQueue.push(cycle);
  this.emit(Engine.EVENT_ENQUEUED_TASK, { id: taskId });
  gear.pushedNewTask(this);
  return taskId;
};

Engine.prototype.switchOn = function () {
  gear.switchOn(this);
};

Engine.prototype.switchOff = function () {
  gear.switchOff(this);
};

Engine.prototype._shouldStop = function () {
  return this.status === Engine.STATUS_OFF;
};

Engine.prototype._run = function () {
  const cycle = this.runningQueue.shift();

  if (undefined !== cycle) {
    gear.runningTask(this);
    cycle.next();
  } else {
    gear.noPendingTasks(this);
  }
};

function getBrowserSequenceGenerator(engine, sequence, generatorArgs) {
  function* Generator(args) {
    const taskId = uuid.v4();
    const taskDone = {
      id: taskId,
      status: Engine.TASK_STATUS_OK
    };

    yield taskId;

    try {
      if (0 < sequence.length) {
        for (let i = 0, step = sequence[i]; i < sequence.length; i++, step = sequence[i]) {
          if (engine._shouldStop()) {
            args = undefined;
            taskDone.status = Engine.TASK_STATUS_STOPPED;
            break;
          }

          if (undefined === args) {
            engine.emit(Engine.EVENT_STEP_SEQUENCE_STARTS, {});
            args = [];
          } else {
            engine.emit(Engine.EVENT_STEP_SEQUENCE_STARTS, {
              arguments: _clone(args)
            });

            if (!(args instanceof Array)) {
              args = [args];
            }
          }

          args.unshift(this, engine.browser);
          /* jshint loopfunc: true */
          //Ensure to call step asynchronously step execute next() from the same generator
          //therefore to avoid crashes due to call next() synchronously, it is wrapped by setImmediate
          args = yield setImmediate(function () { step.apply(step, args); });
          /* jshint loopfunc: false */

          engine.emit(Engine.EVENT_STEP_SEQUENCE_ENDS, {
            result: _clone(args)
          });
        }

        taskDone.results = args;
      } else {
        taskDone.results = undefined;
      }
    } catch (error) {
      taskDone.status = Engine.TASK_STATUS_ERROR;
      taskDone.error = error;
    } finally {
      gear.taskDone(engine, taskDone);
      engine.emit(Engine.EVENT_TASK_DONE, taskDone);
    }
  }

  Generator.prototype.emit = function (event, data) {
    engine.emit(event, data);
  };

  return new Generator(generatorArgs);
}

module.exports = Engine;
