'use strict';

var Engine = require('../engine');

const EVENT_TASK_DONE = Engine.EVENT_TASK_DONE;
const TASK_STATUS_OK = Engine.TASK_STATUS_OK;
const TASK_STATUS_STOPPED = Engine.TASK_STATUS_STOPPED;
const TASK_STATUS_ERROR = Engine.TASK_STATUS_ERROR;

/*
 * Number of yields produced: 1
 */
function run(genFunc) {
  var taskId, config;
  var generator = genFunc();
  var initYieldedObj = generator.next();

  if (!initYieldedObj.done) {
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

    taskId = config.engine.speedUp(config.sequence, config.arguments);
  }
}

module.exports = {
  run: run
};
