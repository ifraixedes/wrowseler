'use strict';

var seleniumWb = require('selenium-webdriver');
var chai = require('chai');
var Engine = require('../../../lib/engine');
var rodsInjections = require('../../../lib/rods/browser/injections');
var rodsHelpers = require('../../../lib/rods/browser/helpers');

describe('When wrowseler execute a sequence which', function () {
  var engine, wbChrome;
  var expect = chai.expect;
  var numOfPElements;

  beforeEach(function () {
    wbChrome = new seleniumWb.Builder()
    .withCapabilities(seleniumWb.Capabilities.chrome())
    .build();

    engine = new Engine({
      switchOn: true,
      browser: wbChrome
    });
  });

  afterEach(function () {
    wbChrome.controlFlow().reset();
  });

  describe('inject a synchronous function which returns an integer', function () {
    it('returns an integer when finishes', function (done) {
      engine.speedUp([scriptInjectionStep], syncFunctionTest, false);

      this.timeout(10000);
      engine.on(Engine.EVENT_TASK_DONE, function (taskDoneObj) {
        expect(taskDoneObj).to.have.property('results');
        expect(taskDoneObj.results).to.be.a('number');
        numOfPElements = taskDoneObj.results;
        done();
      });
    });
  });

  describe('inject an asynchronous function which returns an integer', function () {
    it('returns an integer when finishes', function (done) {
      engine.speedUp([scriptInjectionStep], asyncFunctionTest, false);

      this.timeout(10000);
      engine.on(Engine.EVENT_TASK_DONE, function (taskDoneObj) {
        expect(taskDoneObj).to.have.property('results');
        expect(taskDoneObj.results).to.equal(numOfPElements);
        done();
      });
    });
  });

  describe('inject a synchronous script which returns an integer', function () {
    it('returns an integer when finishes', function (done) {
      engine.speedUp([scriptInjectionStep], syncScriptBlockTest, false);

      this.timeout(10000);
      engine.on(Engine.EVENT_TASK_DONE, function (taskDoneObj) {
        expect(taskDoneObj).to.have.property('results');
        expect(taskDoneObj.results).to.equal(numOfPElements);
        done();
      });
    });
  });

  describe('inject a asynchronous function which returns an integer', function () {
    it('returns an integer when finishes', function (done) {
      engine.speedUp([scriptInjectionStep], asyncScriptBlockTest, false);

      this.timeout(10000);
      engine.on(Engine.EVENT_TASK_DONE, function (taskDoneObj) {
        expect(taskDoneObj).to.have.property('results');
        expect(taskDoneObj.results).to.be.a('number');
        expect(taskDoneObj.results).to.equal(numOfPElements);
        done();
      });
    });
  });

  describe('inject a synchronous function which returns an object', function () {
    it('returns an integer when finishes', function (done) {
      engine.speedUp([scriptInjectionStep], syncFunctionTest, true);

      this.timeout(10000);
      engine.on(Engine.EVENT_TASK_DONE, function (taskDoneObj) {
        expect(taskDoneObj).to.have.property('results');
        expect(taskDoneObj.results).to.be.a('object');
        expect(taskDoneObj.results).to.have.property('name', 'p');
        expect(taskDoneObj.results).to.have.property('amount', numOfPElements);
        done();
      });
    });
  });

  describe('inject an asynchronous function which returns an integer', function () {
    it('returns an integer when finishes', function (done) {
      engine.speedUp([scriptInjectionStep], asyncFunctionTest, true);

      this.timeout(10000);
      engine.on(Engine.EVENT_TASK_DONE, function (taskDoneObj) {
        expect(taskDoneObj).to.have.property('results');
        expect(taskDoneObj.results).to.be.a('object');
        expect(taskDoneObj.results).to.have.property('name', 'p');
        expect(taskDoneObj.results).to.have.property('amount', numOfPElements);
        done();
      });
    });
  });

  describe('inject a synchronous script which returns an integer', function () {
    it('returns an integer when finishes', function (done) {
      engine.speedUp([scriptInjectionStep], syncScriptBlockTest, true);

      this.timeout(10000);
      engine.on(Engine.EVENT_TASK_DONE, function (taskDoneObj) {
        expect(taskDoneObj).to.have.property('results');
        expect(taskDoneObj.results).to.be.a('object');
        expect(taskDoneObj.results).to.have.property('name', 'p');
        expect(taskDoneObj.results).to.have.property('amount', numOfPElements);
        done();
      });
    });
  });

  describe('inject a asynchronous function which returns an integer', function () {
    it('returns an integer when finishes', function (done) {
      engine.speedUp([scriptInjectionStep], asyncScriptBlockTest, true);

      this.timeout(10000);
      engine.on(Engine.EVENT_TASK_DONE, function (taskDoneObj) {
        expect(taskDoneObj).to.have.property('results');
        expect(taskDoneObj.results).to.be.a('object');
        expect(taskDoneObj.results).to.have.property('name', 'p');
        expect(taskDoneObj.results).to.have.property('amount', numOfPElements);
        done();
      });
    });
  });
});

function scriptInjectionStep(generator, browser, injectionTestFunction, objectReturnType) {
  browser.controlFlow().on('uncaughtException', function (error) {
    generator.throw(error);
  });

  browser.get('http://www.google.com')
  .then(function () {
    injectionTestFunction(browser, objectReturnType)
    .then(function (result) {
      browser.controlFlow().removeAllListeners('uncaughtException');
      browser.quit().then(function () { generator.next(result); });
    });
  });
}


/* jshint browser: true, node: false */
function syncFunctionTest(browser, objectReturnType) {
  function testSyncFn(returnObject) {
    if (returnObject) {
      return {
        name: 'p',
        amount: document.querySelectorAll('p').length
      };
    } else {
      return document.querySelectorAll('p').length;
    }
  }

  return rodsInjections.syncFunction(browser, testSyncFn, objectReturnType);
}

function asyncFunctionTest(browser, objectReturnType) {
  function testAsynFn(returnObject) {
    setTimeout(function () {
      if (returnObject) {
        /* jshint ignore: start */
        done({
          name: 'p',
          amount: document.querySelectorAll('p').length
        });
      } else {
        done(document.querySelectorAll('p').length);
        /* jshint ignore: end */
      }
    });
  }

  return rodsInjections.asyncFunction(browser, testAsynFn, objectReturnType);
}

function syncScriptBlockTest(browser, objectReturnType) {
  var funcsObj = {
    testSyncFn: function (returnObject) {
      if (returnObject) {
        return {
          name: 'p',
          amount: document.querySelectorAll('p').length
        };
      } else {
        return document.querySelectorAll('p').length;
      }
    },
    callerFunc: function (returnObject) {
      /* jshint ignore: start */
      return testSyncFn(returnObject);
      /* jshint ignore: end */
    }
  };
  var scriptBlock = rodsHelpers.objectPropertiesToScriptBlock(funcsObj);

  return rodsInjections.syncScriptBlock(browser, scriptBlock, 'callerFunc', objectReturnType);
}

function asyncScriptBlockTest(browser, objectReturnType) {
  var funcsObj = {
    testAsyncFn: function (returnObject, done) {
      setTimeout(function () {
        if (returnObject) {
          done({
            name: 'p',
            amount: document.querySelectorAll('p').length
          });
        } else {
          done(document.querySelectorAll('p').length);
        }
      });
    },
    callerFunc: function (returnObject) {
      /* jshint ignore: start */
      testAsyncFn(returnObject, done);
      /* jshint ignore: end */
    }
  };
  var scriptBlock = rodsHelpers.objectPropertiesToScriptBlock(funcsObj);

  return rodsInjections.asyncScriptBlock(browser, scriptBlock, 'callerFunc', objectReturnType);
}

/* jshint browser: false, node: true */
