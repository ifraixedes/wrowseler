'use strict';

var seleniumWb = require('selenium-webdriver');

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

module.exports = {
  homeStep: homeStep,
  searchStep: searchStep,
  onLoadSearchResultsPage: onLoadSearchResultsPage,
  getResultsPageTitle: getResultsPageTitle,
  throwErrorOnGenerator: throwErrorOnGenerator,
  throwErrorOnBrowser: throwErrorOnBrowser
};
