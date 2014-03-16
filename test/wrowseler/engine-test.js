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
        taskId = engine.run();
      });

      it('return a task object', function () {
        expect(taskId).match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
      });

      it('when task finishes, it returns an object with task\'s id and results is undefined', function () {
        var taskDone = tasksDone[0];
        expect(tasksDone).to.have.length(1);
        expect(taskDone).to.have.ownProperty('id', taskId);
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

        taskId = engine.run(steps, 0);
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
        taskId = engine.run(null, 0);
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

        taskId = engine.run(steps, 0);
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

  describe('instance can only run one task at time', function () {
    var engine;

    before(function () {
      engine = new Engine({
        browser: {},
        sequence: [function (generator, browser) { }]
      });
    });

    it('so when run the first task, a task id is returned', function () {
      expect(engine.run()).to.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
    });

    it('however if another task is run before a previous one is finished then throw an Error', function () {
      expect(engine.run.bind(engine)).to.throws(Error, 'The engine is running one task. So far only one task can be executed a time');
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
        browser: {},
        sequence: [function (generator, browser) { generator.throw(new Error('Aborted')); }]
      });
        
      engine.on('task-done', taskDoneListener);
    });
      
    it('which return a task id', function () {
      taskId = engine.run();
      expect(taskId).to.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
    });

    describe('but if the sequence produce and error', function () {
      it('task done object ', function () {
        var taskDone = tasksDone[0];
        expect(tasksDone).to.have.length(1);
        expect(taskDone).to.have.ownProperty('id', taskId);
        expect(taskDone).not.to.have.ownProperty('results');
        expect(taskDone).to.have.ownProperty('error');
        expect(taskDone.error).to.instanceOf(Error).and.ownProperty('message', 'Arborted');
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
    expect(taskDone).to.have.ownProperty('id', taskId);
    expect(taskDone).to.have.ownProperty('results');
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

