'use strict';

var seleniumWb = require('selenium-webdriver');
var chai = require('chai');
var wrowseler = require('../../lib/wrowseler');
var stepsCollectionHelper = require('../helpers/google-steps-collection');

describe('Wroweler browses Google', function () {
  var engine, wbChrome;
  var expect = chai.expect;
  var WEngine = wrowseler.Engine;
  var searchText = 'webdriver';

  beforeEach(function () {
    wbChrome = new seleniumWb.Builder()
    .withCapabilities(seleniumWb.Capabilities.chrome())
    .build();

    engine = new WEngine({
      switchOn: true,
      browser: wbChrome,
      sequence: [stepsCollectionHelper.homeStep, stepsCollectionHelper.searchStep]
    });
  });

  afterEach(function () {
    wbChrome.controlFlow().reset();
  });

  it('with a steps sequence which should return the search result page\'s title', function (done) {
    var taskId = engine.speedUp([stepsCollectionHelper.onLoadSearchResultsPage, stepsCollectionHelper.getResultsPageTitle], searchText);

    this.timeout(20000);
    engine.on(WEngine.EVENT_TASK_DONE, function (taskDoneObj) {
      expect(taskDoneObj).to.have.property('id', taskId);
      expect(taskDoneObj).to.have.property('results');
      expect(taskDoneObj.results).to.match(new RegExp(searchText));
      done();
    });
  });

  it('with a steps sequence that fail in one step of the sequence should report an error', function (done) {
    var taskId = engine.speedUp([stepsCollectionHelper.throwErrorOnGenerator, stepsCollectionHelper.getResultsPageTitle], searchText);

    this.timeout(20000);
    engine.on(WEngine.EVENT_TASK_DONE, function (taskDoneObj) {
      expect(taskDoneObj).to.have.property('id', taskId);
      expect(taskDoneObj).not.to.have.property('results');
      expect(taskDoneObj).to.have.property('error');
      expect(taskDoneObj.error).to.be.an.instanceOf(Error).and.have.property('message', 'Generator error thrown');
      done();
    });
  });

  it('with a steps sequence that throw unexpected exception in one step of the sequence should report an error', function (done) {
    var taskId = engine.speedUp([stepsCollectionHelper.throwErrorOnBrowser, stepsCollectionHelper.getResultsPageTitle], searchText);

    this.timeout(20000);
    engine.on(WEngine.EVENT_TASK_DONE, function (taskDoneObj) {
      expect(taskDoneObj).to.have.property('id', taskId);
      expect(taskDoneObj).not.to.have.property('results');
      expect(taskDoneObj).to.have.property('error');
      expect(taskDoneObj.error).to.be.an.instanceOf(Error).and.have.property('message', 'Browser error thrown');
      done();
    });
  });
});

