'use strict';

var chai = require('chai');
var Engine = require('../../lib/wrowseler/engine');

describe('Browserler engine', function () {
  var should = chai.should();

  describe('is instanitated without any parameters', function () {
    it('throws an error', function () {
      var engine;

      try {
        engine = new Engine();
      } catch (e) {
        e.should.instanceOf(Error);
        e.message.should.match(/Cannot read property/);
        return;
      }

      throw new Error('Engine instantition should throw an Error but it did not');
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
        taskId.should.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
      });

      it('when task finish, we get back a task done object with its id', function () {
        var taskDone = tasksDone[0];
        tasksDone.should.length(1);
        taskDone.should.have.a.property('id', taskId);
        taskDone.should.have.a.property('result', undefined);
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
        taskId.should.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
      });

      for (let si = 0; si < numSteps; si++) {
        it('step ' + si + ' has been called with the agument number of the previous step and added new argument which it is the previous number plus 1', function (idx, done) {
          function waitUntilStepEnds() {
            if (idx < stepsArguments.length) {
              let stepArgs = stepsArguments[idx];
              stepArgs.should.have.length(idx + 2);
              stepArgs[0].should.deep.equals(engine.browser);

              for (let ai = 2; ai < stepArgs.length; ai++) {
                stepArgs[ai].should.equals(stepArgs[ai - 1] + 1);
              }

              done();
            } else {
              setImmediate(waitUntilStepEnds);
            }
          }

          waitUntilStepEnds(idx);
        }.bind(null, si));
      }

      it('when task finish, we get back a task done object with its id', function (done) {
        function waitUntilEnd() {
          if (0 < tasksDone.length) {
            let taskDone = tasksDone[0];
            tasksDone.should.length(1);
            taskDone.should.have.a.property('id', taskId);
            taskDone.should.have.a.property('result', undefined);
            done();
          } else {
            setImmediate(waitUntilEnd);
          }
        }

        waitUntilEnd();
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
        console.log(stepsArguments.length);

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
        taskId.should.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
      });

      for (let si = 0; si < numBaseSteps; si++) {
        it('step ' + si + ' has been called with the agument number of the previous step and added new argument which it is the previous number plus 1', function (idx, done) {
          function waitUntilStepEnds() {
            if (idx < stepsArguments.length) {
              let stepArgs = stepsArguments[idx];
              stepArgs.should.have.length(idx + 2);
              stepArgs[0].should.deep.equals(engine.browser);

              for (let ai = 2; ai < stepArgs.length; ai++) {
                stepArgs[ai].should.equals(stepArgs[ai - 1] + 1);
              }

              done();
            } else {
              setImmediate(waitUntilStepEnds);
            }
          }

          waitUntilStepEnds(idx);
        }.bind(null, si));
      }

      it('when task finish, we get back a task done object with its id', function () {
        var taskDone = tasksDone[0];
        tasksDone.should.length(1);
        taskDone.should.have.a.property('id', taskId);
        taskDone.should.have.a.property('result', undefined);
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
        taskId.should.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
      });

      for (let si = 0; si < numSteps + numBaseSteps; si++) {
        it('step ' + si + ' has been called with the agument number of the previous step and added new argument which it is the previous number plus 1', function (idx, done) {
          function waitUntilStepEnds() {
            if (idx < stepsArguments.length) {
              let stepArgs = stepsArguments[idx];
              stepArgs.should.have.length(idx + 2);
              stepArgs[0].should.deep.equals(engine.browser);

              for (let ai = 2; ai < stepArgs.length; ai++) {
                stepArgs[ai].should.equals(stepArgs[ai - 1] + 1);
              }

              done();
            } else {
              setImmediate(waitUntilStepEnds);
            }
          }

          waitUntilStepEnds(idx);
        }.bind(null, si));
      }

      it('when task finish, we get back a task done object with its id', function (done) {
        function waitUntilEnd() {
          if (0 < tasksDone.length) {
            let taskDone = tasksDone[0];
            tasksDone.should.length(1);
            taskDone.should.have.a.property('id', taskId);
            taskDone.should.have.a.property('result', undefined);
            done();
          } else {
            setImmediate(waitUntilEnd);
          }
        }

        waitUntilEnd();
      });
    });
  });
});
