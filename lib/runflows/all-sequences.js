'use strict';

var Engine = require('../engine');

const EVENT_TASK_DONE = Engine.EVENT_TASK_DONE;
const TASK_STATUS_OK = Engine.TASK_STATUS_OK;
const TASK_STATUS_STOPPED = Engine.TASK_STATUS_STOPPED;
const TASK_STATUS_ERROR = Engine.TASK_STATUS_ERROR;

/*
 * Number of yields produced: As many as requested, driven by
 *      the generator function when it call the last yield that sent
 *      an object with `sequence` and `arguments` (optional)
 * The first yield of the generator have to send an object
 *      whit the next attributes to execute the sequence
 *       - Object engine: An Engine instance
 *       - Object sequence: An array of sequence's steps to execute; it is
 *              passed to Engine.speedUp
 *       - [Object] arguments: An array of arguments to be used to
 *              to execute the sequence; they are passed to Engine.speedUp
 * The following ones have to send the same object but without the engine, however
 * if a yield send a null value, then it release the registered engine
 * EVENT_TASK_DONE event listener and generator will not called any more.
 *
 * NOTE: Execute a last yield statement with null is very recommended to be able
 *      to release the registered event listener which will not be more useful
 */
function run(genFunc) {
  function speedUpSequence(engine, sequence, seqInitArgs) {
    var argsArray;

    if (seqInitArgs) {
      argsArray = seqInitArgs.slice(0);
    } else {
      argsArray = [];
    }

    argsArray.splice(0, 0, sequence);
    engine.speedUp.apply(engine, argsArray);
  }

  var config, engine;
  var generator = genFunc();
  var initYieldedObj = generator.next();

  if (initYieldedObj.done) {
    return;
  }

  config = initYieldedObj.value;
  engine = config.engine;
  engine.on(EVENT_TASK_DONE, function taskDoneListener(taskResults) {
    var genResObj;

    switch (taskResults.status) {
      case TASK_STATUS_OK:
        genResObj = generator.next(taskResults.results);
        break;
      case TASK_STATUS_ERROR:
        genResObj = generator.throw(taskResults.error);
        break;
      case TASK_STATUS_STOPPED:
        genResObj = generator.next(null);
        break;
      default:
        engine.removeListener(EVENT_TASK_DONE, taskDoneListener);
        generator.throw(new Error('Unsupported task resutls status: ' + taskResults.staus));
    }

    if ((genResObj.done) || (genResObj.value === null)) {
      engine.removeListener(EVENT_TASK_DONE, taskDoneListener);

      if (genResObj.done === false) {
        generator.next();
      }

      return;
    }

    speedUpSequence(engine, genResObj.value.sequence, genResObj.value.arguments);
  });

  speedUpSequence(engine, config.sequence, config.arguments);
}

module.exports = {
  run: run
};
