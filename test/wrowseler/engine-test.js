'use strict';

var chai = require('chai');
var _ = require('lodash');
var Engine = require('../../lib/wrowseler/engine');

var _clone = _.clone;
var _last = _.last;

describe('Browserler engine', function () {
  var expect = chai.expect;

  describe('is instanitated without any parameters', function () {
    it('throws an error', function () {
      var engine;

      try {
        engine = new Engine();
      } catch (e) {
        expect(e).instanceOf(Error);
        expect(e).match(/Cannot read property/);
        return;
      }
    });
  });

  describe('is instantiated without any base sequence', function () {
    var engine;

    before(function () {
      engine = new Engine({
        switchOn: true,
        browser: {}
      });
    });

    describe('and it runs without any senquence', function () {
      function taskDoneListener(task) {
        tasksDone.push(task);
      }

      function stepSeqStarts(args) {
        stepSeqStartsCounter++;
      }

      function stepSeqEnds(result) {
        stepSeqEndsCounter++;
      }

      var tasksDone = [];
      var taskId;
      var stepSeqStartsCounter = 0;
      var stepSeqEndsCounter = 0;

      before(function () {
        engine.on(Engine.EVENT_TASK_DONE, taskDoneListener);
        engine.on(Engine.EVENT_STEP_SEQUENCE_STARTS, stepSeqStarts);
        engine.on(Engine.EVENT_STEP_SEQUENCE_ENDS, stepSeqEnds);
        taskId = engine.speedUp();
      });

      it('return a task id', function () {
        expect(taskId).match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
      });

      it('when task finishes, it returns an object with task\'s id, status of "ok" and results is undefined', function () {
        var taskDone = tasksDone[0];
        expect(stepSeqStartsCounter).to.equal(0);
        expect(stepSeqEndsCounter).to.equal(0);
        expect(tasksDone).to.have.length(1);
        expect(taskDone).to.have.property('id', taskId);
        expect(taskDone).to.have.property('status', Engine.TASK_STATUS_OK);
        expect(taskDone).to.have.ownProperty('results');
        expect(taskDone.results).to.equal(undefined);
      });
    });

    describe('and it runs with a step sequences', function () {
      function taskDoneListener(task) {
        tasksDone.push(task);
      }

      function stepSeqStarts(args) {
        stepSeqStartsArgs = args;
        stepSeqStartsCounter++;
      }

      function stepSeqEnds(result) {
        stepSeqEndsResult = result;
        stepSeqEndsCounter++;
      }

      function fakeStep() {
        var generator = arguments[0];
        var args = [].slice.call(arguments, 1);
        var argsToPassNext = args.slice(1);

        stepsArguments.push(args);
        argsToPassNext.push(argsToPassNext[argsToPassNext.length - 1] + 1);

        setImmediate(function () {
          generator.next(argsToPassNext);
        });
      }

      var stepsArguments = [];
      var tasksDone = [];
      var numSteps = 3;
      var stepSeqStartsCounter = 0;
      var stepSeqStartsArgs;
      var stepSeqEndsCounter = 0;
      var stepSeqEndsResult;
      var taskId;

      before(function () {
        var steps = [];

        engine.on(Engine.EVENT_TASK_DONE, taskDoneListener);
        engine.on(Engine.EVENT_STEP_SEQUENCE_STARTS, stepSeqStarts);
        engine.on(Engine.EVENT_STEP_SEQUENCE_ENDS, stepSeqEnds);

        for (let si = 0; si < numSteps; si++) {
          steps.push(fakeStep);
        }

        taskId = engine.speedUp(steps, 0);
      });

      it('return a task object', function () {
        expect(taskId).to.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
      });

      for (let si = 0; si < numSteps; si++) {
        it('step ' + si + ' has been called with the agument number of the previous step and added new argument which it is the previous number plus 1', function (idx, done) {
          waitUntilStepEnds(expect, engine, stepsArguments, idx, done);
        }.bind(null, si));
      }

      it('when task finishes, it returns an object with task\'s id and results', function (done) {
        waitTaskUntilDone(expect, taskId, tasksDone, stepsArguments, done);
      });

      it('when task finishes the event step sequence start has been called as many times as number of steps and last time received the same argumes as the last step', function (done) {
        function waitUntilEventStepsReceived() {
          if ((stepSeqStartsCounter < numSteps) || (stepSeqEndsCounter < numSteps)) {
            setTimeout(waitUntilEventStepsReceived, 100);
          } else {
            let lastStepArgs = _clone(_last(stepsArguments));
            lastStepArgs.shift();

            expect(stepSeqStartsCounter).to.equal(numSteps);
            expect(stepSeqEndsCounter).to.equal(numSteps);
            expect(stepSeqStartsArgs).to.have.property('arguments');
            expect(stepSeqStartsArgs.arguments).to.eql(lastStepArgs);
            expect(stepSeqEndsResult).to.have.property('result');
            expect(stepSeqEndsResult.result).to.eql(tasksDone[0].results);
            done();
          }
        }

        waitUntilEventStepsReceived();
      });
    });
  });

  describe('is instantiated with a base sequence', function () {
    function fakeStep(stepsArguments) {
      return function () {
        var generator = arguments[0];
        var args = [].slice.call(arguments, 1);
        var argsToPassNext = args.slice(1);

        stepsArguments.push(args);
        argsToPassNext.push(argsToPassNext[argsToPassNext.length - 1] + 1);
        setImmediate(function () {
          generator.next(argsToPassNext);
        });
      };
    }

    var engine;
    var stepsArguments = [];
    var numBaseSteps = 3;

    before(function () {
      var baseSequence = [];

      for (let si = 0; si < numBaseSteps; si++) {
        baseSequence.push(fakeStep(stepsArguments));
      }

      engine = new Engine({
        switchOn: true,
        browser: {},
        sequence: baseSequence
      });
    });

    describe('and it runs without any senquence', function () {
      function taskDoneListener(task) {
        tasksDone.push(task);
      }

      var tasksDone = [];
      var taskId;

      before(function () {
        engine.on(Engine.EVENT_TASK_DONE, taskDoneListener);
        taskId = engine.speedUp(null, 0);
      });

      it('return a task object', function () {
        expect(taskId).to.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
      });

      for (let si = 0; si < numBaseSteps; si++) {
        it('step ' + si + ' has been called with the agument number of the previous step and added new argument which it is the previous number plus 1', function (idx, done) {
          waitUntilStepEnds(expect, engine, stepsArguments, idx, done);
        }.bind(null, si));
      }

      it('when task finishes, it returns an object with task\'s id and results', function (done) {
        waitTaskUntilDone(expect, taskId, tasksDone, stepsArguments, done);
      });
    });

    describe('and it runs with a step sequences', function () {
      function taskDoneListener(task) {
        tasksDone.push(task);
      }

      var tasksDone = [];
      var numSteps = 3;
      var taskId;

      before(function () {
        var steps = [];

        stepsArguments.splice(0, stepsArguments.length);
        engine.on(Engine.EVENT_TASK_DONE, taskDoneListener);

        for (let si = 0; si < numSteps; si++) {
          steps.push(fakeStep(stepsArguments));
        }

        taskId = engine.speedUp(steps, 0);
      });

      it('return a task object', function () {
        expect(taskId).to.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
      });

      for (let si = 0; si < numSteps + numBaseSteps; si++) {
        it('step ' + si + ' has been called with the agument number of the previous step and added new argument which it is the previous number plus 1', function (idx, done) {
          waitUntilStepEnds(expect, engine, stepsArguments, idx, done);
        }.bind(null, si));
      }

      it('when task finishes, it returns an object with task\'s id and results', function (done) {
        waitTaskUntilDone(expect, taskId, tasksDone, stepsArguments, done);
      });
    });
  });

  describe('instance non-switched on, when it has been instantitated', function () {
    function taskDoneListener(task) {
      tasksDone.push(task);
    }

    function fakeStep() {
      var generator = arguments[0];
      var args = [].slice.call(arguments, 1);
      var argsToPassNext = args.slice(1);

      sequenceExecuted = true;
      stepsArguments.push(args);
      argsToPassNext.push(argsToPassNext[argsToPassNext.length - 1] + 1);

      setImmediate(function () {
        generator.next(argsToPassNext);
      });
    }

    var stepsArguments = [];
    var tasksDone = [];
    var numSteps = 3;
    var taskId;
    var sequenceExecuted = false;
    var engine;

    before(function () {
      var steps = [];

      for (let si = 0; si < numSteps; si++) {
        steps.push(fakeStep);
      }

      engine = new Engine({
        browser: {},
        sequence: steps
      });
      engine.on(Engine.EVENT_TASK_DONE, taskDoneListener);
      taskId = engine.speedUp(null, 0);
    });

    it('return a task object', function () {
      expect(taskId).to.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
    });

    it('doesn\' execute the sequence until the engine is switched on', function (done) {
      // Delay to give a gap of time for the posibility that the sequence be executed
      setTimeout(function () {
        expect(sequenceExecuted).to.equal(false);
        engine.switchOn();
        done();
      }, 500);
    });

    for (let si = 0; si < numSteps; si++) {
      it('step ' + si + ' has been called with the agument number of the previous step and added new argument which it is the previous number plus 1', function (idx, done) {
        waitUntilStepEnds(expect, engine, stepsArguments, idx, done);
      }.bind(null, si));
    }

    it('when task finishes, it returns an object with task\'s id and results', function (done) {
      waitTaskUntilDone(expect, taskId, tasksDone, stepsArguments, done);
    });
  });

  describe('instance which runs a steps sequence', function () {
    function taskDoneListener(task) {
      tasksDone.push(task);
    }

    var engine;
    var taskId;
    var tasksDone = [];

    before(function () {
      engine = new Engine({
        switchOn: true,
        browser: {},
        sequence: [function (generator, browser) { generator.throw(new Error('Aborted')); }]
      });

      engine.on(Engine.EVENT_TASK_DONE, taskDoneListener);
    });

    it('which return a task id', function () {
      taskId = engine.speedUp();
      expect(taskId).to.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
    });

    describe('but if the sequence produce and error', function () {
      it('task done object ', function () {
        var taskDone = tasksDone[0];
        expect(tasksDone).to.have.length(1);
        expect(taskDone).to.have.property('id', taskId);
        expect(taskDone).to.have.property('status', Engine.TASK_STATUS_ERROR);
        expect(taskDone).not.to.have.property('results');
        expect(taskDone).to.have.property('error');
        expect(taskDone.error).to.instanceOf(Error).and.property('message', 'Aborted');
      });
    });
  });

  describe('instance which runs two steps sequences but it is stopped before finishes', function () {
    function taskDoneListener(task) {
      tasksDone.push(task);
    }

    function delayedSequenceStep(generator, browser) {
      setTimeout(function () { generator.next('executed'); }, 300);
    }

    var engine;
    var taskId1;
    var taskId2;
    var tasksDone = [];

    before(function () {
      engine = new Engine({
        browser: {}
      });

      engine.on(Engine.EVENT_TASK_DONE, taskDoneListener);
      taskId1 = engine.speedUp([delayedSequenceStep, delayedSequenceStep]);
      taskId2 = engine.speedUp([delayedSequenceStep, delayedSequenceStep]);
      engine.switchOn();
      engine.switchOff();
    });

    it('which returns the two task ids', function () {
      expect(taskId1).to.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
      expect(taskId2).to.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
    });

    it('task 1 ends with an status of "stopped" and undefined as results', function (done) {
      setTimeout(function () {
        var taskDone = tasksDone[0];
        expect(tasksDone).to.have.length(1);
        expect(taskDone).to.have.property('id', taskId1);
        expect(taskDone).to.have.property('status', 'stopped');
        expect(taskDone).to.have.ownProperty('results');
        expect(taskDone.results).to.equal(undefined);
        done();
      }, 500);
    });

    it('task 2 doesn\'t finish in the stoped cycle', function (done) {
      setTimeout(function () {
        var taskDone = tasksDone[0];
        expect(tasksDone).to.have.length(1);
        done();
      }, 1000);
    });

    describe('but when it is switched on again', function () {
      before(function () {
        engine.switchOn();
      });

      it('task 2 finishes with status of "ok" and the expected results value', function (done) {
        setTimeout(function () {
          var taskDone = tasksDone[1];
          expect(tasksDone).to.have.length(2);
          expect(taskDone).to.have.property('id', taskId2);
          expect(taskDone).to.have.property('status', Engine.TASK_STATUS_OK);
          expect(taskDone).to.have.property('results', 'executed');
          done();
        }, 1000);
      });
    });
  });

  describe('instance which runs a sequence of one step which emits an event', function () {
    function fakeStep(generator, browser) {
      generator.emit('test-consumer-event', { msg: 'it is a test' });
      generator.next();
    }

    var eventData = null;

    before(function () {
      var engine = new Engine({
        switchOn: true
      });
      engine.on('test-consumer-event', function (data) { eventData = data; });
      engine.speedUp([fakeStep]);
    });

    it('emits the event to the engine instance', function (done) {
      function waitUntilConsumerEvent() {
        if (eventData !== null) {
          expect(eventData).to.have.property('msg', 'it is a test');
          done();
        } else {
          setTimeout(waitUntilConsumerEvent, 100);
        }
      }

      waitUntilConsumerEvent();
    });
  });
});

function waitTaskUntilDone(expect, taskId, tasksDone, stepsArguments, done) {
  if (0 < tasksDone.length) {
    let taskDone = tasksDone[0];
    let expectedResults = stepsArguments[stepsArguments.length - 1].slice(1);

    expectedResults.push(expectedResults[expectedResults.length - 1] + 1);
    expect(tasksDone).to.have.length(1);
    expect(taskDone).to.have.property('id', taskId);
    expect(taskDone).to.have.property('status', Engine.TASK_STATUS_OK);
    expect(taskDone).to.have.property('results');
    expect(taskDone.results).to.eql(expectedResults);
    done();
  } else {
    setImmediate(waitTaskUntilDone.apply.bind(null, null, arguments));
  }
}

function waitUntilStepEnds(expect, engine, stepsArguments, idx, done) {

  if (idx < stepsArguments.length) {
    let stepArgs = stepsArguments[idx];

    expect(stepArgs).to.have.length(idx + 2);
    expect(stepArgs[0]).deep.equals(engine.browser);

    for (let ai = 2; ai < stepArgs.length; ai++) {
      expect(stepArgs[ai]).to.equals(stepArgs[ai - 1] + 1);
    }

    done();
  } else {
    setImmediate(waitUntilStepEnds.apply.bind(null, null, arguments));
  }
}
