'use strict';

var seleniumWb = require('selenium-webdriver');
var chai = require('chai');
var wrowseler = require('../../lib/wrowseler');

describe('Wroweler browses Google', function () {
  var wrowselerEngine, wbChrome;
  var expect = chai.expect;
  var searchText = 'webdriver';

  beforeEach(function () {
    wbChrome = new seleniumWb.Builder()
    .withCapabilities(seleniumWb.Capabilities.chrome())
    .build();

    wrowselerEngine = new wrowseler.Engine({
      switchOn: true,
      browser: wbChrome,
      sequence: [homeStep, searchStep]
    });
  });
  
  afterEach(function () {
    wbChrome.controlFlow().reset();
  });

  it('with a steps sequence which should return the search result page\'s title', function (done) {
    var taskId = wrowselerEngine.go([onLoadSearchResultsPage, getResultsPageTitle], searchText);

    this.timeout(20000);
    wrowselerEngine.on('task-done', function (taskDoneObj) {
      expect(taskDoneObj).to.have.property('id', taskId);
      expect(taskDoneObj).to.have.property('results');
      expect(taskDoneObj.results).to.match(new RegExp(searchText));
      done();
    });
  });

  it('with a steps sequence that fail in one step of the sequence should report an error', function (done) {
    var taskId = wrowselerEngine.go([throwErrorOnGenerator, getResultsPageTitle], searchText);

    this.timeout(20000);
    wrowselerEngine.on('task-done', function (taskDoneObj) {
      expect(taskDoneObj).to.have.property('id', taskId);
      expect(taskDoneObj).not.to.have.property('results');
      expect(taskDoneObj).to.have.property('error');
      expect(taskDoneObj.error).to.be.an.instanceOf(Error).and.have.property('message', 'Generator error thrown');
      done();
    });
  });

  it('with a steps sequence that throw unexpected exception in one step of the sequence should report an error', function (done) {
    var taskId = wrowselerEngine.go([throwErrorOnBrowser, getResultsPageTitle], searchText);

    this.timeout(20000);
    wrowselerEngine.on('task-done', function (taskDoneObj) {
      expect(taskDoneObj).to.have.property('id', taskId);
      expect(taskDoneObj).not.to.have.property('results');
      expect(taskDoneObj).to.have.property('error');
      expect(taskDoneObj.error).to.be.an.instanceOf(Error).and.have.property('message', 'Browser error thrown');
      done();
    });
  });
});

function homeStep(generator, browser, queryTextSearch) {
  browser.controlFlow().on('uncaughtException', function (error) {
    generator.throw(error);
  });

  browser.get('http://www.google.com').then(generator.next.bind(generator, queryTextSearch));
}

function searchStep(generator, browser, queryTextSearch) {
  browser.findElement(seleniumWb.By.name('q')).sendKeys(queryTextSearch);
  browser.findElement(seleniumWb.By.name('btnG')).click().then(generator.next.bind(generator, queryTextSearch));
}

function onLoadSearchResultsPage(generator, browser, queryTextSearch) {
  browser.sleep(3000);
  browser.getCurrentUrl().then(function (url) {
    var regExpFromQuery = new RegExp(queryTextSearch);
    if (regExpFromQuery.test(url)) {
      generator.next();
    } else {
      generator.throw(new Error('Page search result didn\'t load in 3 seconds, therefore task has been aborted'));
    }
  });
}

function getResultsPageTitle(generator, browser) {
  browser.getTitle().then(generator.next.bind(generator));
  browser.quit();
  browser.controlFlow().removeAllListeners('uncaughtException');
}

function throwErrorOnGenerator(generator, browser) {
  browser.sleep(100).then(function () {
    generator.throw(new Error('Generator error thrown'));
  });
}

function throwErrorOnBrowser(generator, browser) {
  browser.sleep(100).then(function () {
    throw new Error('Browser error thrown');
  });
}
