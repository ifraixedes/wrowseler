'use strict';

var Engine = require('../engine');

const EVENT_TASK_DONE = Engine.EVENT_TASK_DONE;
const TASK_STATUS_OK = Engine.TASK_STATUS_OK;
const TASK_STATUS_STOPPED = Engine.TASK_STATUS_STOPPED;
const TASK_STATUS_ERROR = Engine.TASK_STATUS_ERROR;

/*
 * Number of yields produced: 1
 * The first yield of the generator have to send an object
 *      whit the next attributes to execute the sequence
 *       - Object engine: An Engine instance
 *       - Object sequence: An array of sequence's steps to execute; it is
 *              passed to Engine.speedUp
 *       - [Object] arguments: An array of arguments to be used to
 *              to execute the sequence; they are passed to Engine.speedUp
 */
function run(genFunc) {
  var taskId, config, argsArray;
  var generator = genFunc();
  var initYieldedObj = generator.next();

  if (initYieldedObj.done) {
    return;
  }

  config = initYieldedObj.value;
  config.engine.on(EVENT_TASK_DONE, function (taskResults) {
    if (taskResults.id === taskId) {
      switch (taskResults.status) {
        case TASK_STATUS_OK:
          generator.next(taskResults.results);
        break;
        case TASK_STATUS_ERROR:
          generator.throw(taskResults.error);
        break;
        case TASK_STATUS_STOPPED:
          generator.next(null);
        break;
        default:
          generator.throw(new Error('Unsupported task resutls status: ' + taskResults.staus));
      }
    }
  });

  if (config.arguments) {
    argsArray = config.arguments.slice(0);
  } else {
    argsArray = [];
  }

  argsArray.splice(0, 0, config.sequence);
  taskId = config.engine.speedUp.apply(config.engine, argsArray);
}

module.exports = {
  run: run
};
