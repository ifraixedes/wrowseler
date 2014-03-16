'use strict';

var seleniumWb = require('selenium-webdriver');
var chai = require('chai');
var wrowseler = require('../../lib/wrowseler');

describe.only('Wroweler browses Google', function () {
  var wrowselerEngine, taskId;
  var expect = chai.expect;
  var searchText = 'webdriver';

  before(function () {
    var wbChrome = new seleniumWb.Builder()
    .withCapabilities(seleniumWb.Capabilities.chrome())
    .build();

    wrowselerEngine = new wrowseler.Engine({
      browser: wbChrome,
      sequence: [homeStep, searchStep, onLoadSearchResultsPage, getResultsPageTitle]
    });
    taskId = wrowselerEngine.run(null, searchText);
  });

  it('with a steps sequence which should return the search result page\'s title', function (done) {
    this.timeout(20000);
    wrowselerEngine.on('task-done', function (taskDoneObj) {
      expect(taskDoneObj).to.have.ownProperty('id', taskId);
      expect(taskDoneObj).to.have.ownProperty('results');
      expect(taskDoneObj.results).to.match(new RegExp(searchText));
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
}
