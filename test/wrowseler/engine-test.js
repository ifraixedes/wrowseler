'use strict';

var chai = require('chai');
var Engine = require('../../lib/wrowseler/engine');

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

      var tasksDone = [];
      var taskId;

      before(function () {
        engine.on('task-done', taskDoneListener);
        taskId = engine.speedUp();
      });

      it('return a task id', function () {
        expect(taskId).match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
      });

      it('when task finishes, it returns an object with task\'s id, status of "ok" and results is undefined', function () {
        var taskDone = tasksDone[0];
        expect(tasksDone).to.have.length(1);
        expect(taskDone).to.have.property('id', taskId);
        expect(taskDone).to.have.property('status', 'ok');
        expect(taskDone).to.have.ownProperty('results');
        expect(taskDone.results).to.equal(undefined);
      });
    });

    describe('and it runs with a step sequences', function () {
      function taskDoneListener(task) {
        tasksDone.push(task);
      }

      function fakeStep() {
        var generator = arguments[0];
        var args = [].slice.call(arguments, 1);
        var argsToPassNext = args.slice(1);

        stepsArguments.push(args);
        argsToPassNext.push(argsToPassNext[argsToPassNext.length - 1] + 1);

        setImmediate(function () {
          generator.next.call(generator, argsToPassNext);
        });
      }

      var stepsArguments = [];
      var tasksDone = [];
      var numSteps = 3;
      var taskId;

      before(function () {
        var steps = [];

        engine.on('task-done', taskDoneListener);

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
          generator.next.call(generator, argsToPassNext);
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
        engine.on('task-done', taskDoneListener);
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
        engine.on('task-done', taskDoneListener);

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
        generator.next.call(generator, argsToPassNext);
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
      engine.on('task-done', taskDoneListener);
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

      engine.on('task-done', taskDoneListener);
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
        expect(taskDone).to.have.property('status', 'error');
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

      engine.on('task-done', taskDoneListener);
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
          expect(taskDone).to.have.property('status', 'ok');
          expect(taskDone).to.have.property('results', 'executed');
          done();
        }, 1000);
      });
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
    expect(taskDone).to.have.property('status', 'ok');
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
