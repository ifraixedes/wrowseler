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
    var browser = {};
    var engine;

    before(function () {
      engine = new Engine({
        browser: browser
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
  });
});
