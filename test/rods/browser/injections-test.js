'use strict';

var seleniumWb = require('selenium-webdriver');
var chai = require('chai');
var sinon = require('sinon');
var rodsInjections = require('../../../lib/rods/browser/injections');
var rodsHelpers = require('../../../lib/rods/browser/helpers');

describe('Browser rods\' injections', function () {
  var expect = chai.expect;

  describe('`asyncFunction`', function () {
    describe('when called without options and without arguments', function () {
      var asyncFn, wbChrome, stub;

      before(function () {
        wbChrome = new seleniumWb.Builder()
        .withCapabilities(seleniumWb.Capabilities.chrome())
        .build();

        stub = sinon.stub(wbChrome, 'executeAsyncScript');
        asyncFn = function () {
          //done()
        };
        rodsInjections.asyncFunction(wbChrome, asyncFn);
      });

      it('`webdriver executeAsyncScript` method is executed with a script that wraps the function and defines a variable called `done`', function () {
        var expectedScript =
          ' var scriptArgs = [].slice.call(arguments, 0);' +
          ' var done = scriptArgs.pop();' +
          ' var func = ' + asyncFn.toString() + ';' +
          ' func.apply(null, scriptArgs);';

        expect(stub.calledOnce).to.be.true;
        expect(stub.args[0][0]).to.equal(expectedScript);
      });

      it ('`webdriver executeAsyncScript` is called without any argument more', function () {
        expect(stub.args[0]).to.length(1);
      });
    });

    describe('when called without options and with arguments', function () {
      var asyncFn, wbChrome, stub;

      before(function () {
        wbChrome = new seleniumWb.Builder()
        .withCapabilities(seleniumWb.Capabilities.chrome())
        .build();

        stub = sinon.stub(wbChrome, 'executeAsyncScript');
        asyncFn = function () {
          //done()
        };
        rodsInjections.asyncFunction(wbChrome, asyncFn, 'argument 1', 'argument 2');
      });

      it('`webdriver executeAsyncScript` method is executed with a script that wraps the function and defines a variable called `done`', function () {
        var expectedScript =
          ' var scriptArgs = [].slice.call(arguments, 0);' +
          ' var done = scriptArgs.pop();' +
          ' var func = ' + asyncFn.toString() + ';' +
          ' func.apply(null, scriptArgs);';

        expect(stub.calledOnce).to.be.true;
        expect(stub.args[0][0]).to.equal(expectedScript);
      });

      it ('`webdriver executeAsyncScript` is called with the provided arguments', function () {
        expect(stub.args[0]).to.length(3);
        expect(stub.args[0][1]).to.equal('argument 1');
        expect(stub.args[0][2]).to.equal('argument 2');
      });
    });

    describe('when called with the option `callbackName` to "myDone" and without arguments', function () {
      var asyncFn, wbChrome, stub;

      before(function () {
        wbChrome = new seleniumWb.Builder()
        .withCapabilities(seleniumWb.Capabilities.chrome())
        .build();

        stub = sinon.stub(wbChrome, 'executeAsyncScript');
        asyncFn = function () {
          //done()
        };
        rodsInjections.asyncFunction(wbChrome, { callbackName: 'myDone' }, asyncFn);
      });

      it('`webdriver executeAsyncScript` method is executed with a script that wraps the function and defines a variable called `myDone`', function () {
        var expectedScript =
          ' var scriptArgs = [].slice.call(arguments, 0);' +
          ' var myDone = scriptArgs.pop();' +
          ' var func = ' + asyncFn.toString() + ';' +
          ' func.apply(null, scriptArgs);';

        expect(stub.calledOnce).to.be.true;
        expect(stub.args[0][0]).to.equal(expectedScript);
      });

      it ('`webdriver executeAsyncScript` is called without any argument more', function () {
        expect(stub.args[0]).to.length(1);
      });
    });

    describe('when called with the option `callbackName` to "myDone" and with arguments', function () {
      var asyncFn, wbChrome, stub;

      before(function () {
        wbChrome = new seleniumWb.Builder()
        .withCapabilities(seleniumWb.Capabilities.chrome())
        .build();

        stub = sinon.stub(wbChrome, 'executeAsyncScript');
        asyncFn = function () {
          //done()
        };
        rodsInjections.asyncFunction(wbChrome, { callbackName: 'myDone' }, asyncFn, 'argument 1', 'argument 2');
      });

      it('`webdriver executeAsyncScript` method is executed with a script that wraps the function and defines a variable called `myDone`', function () {
        var expectedScript =
          ' var scriptArgs = [].slice.call(arguments, 0);' +
          ' var myDone = scriptArgs.pop();' +
          ' var func = ' + asyncFn.toString() + ';' +
          ' func.apply(null, scriptArgs);';

        expect(stub.calledOnce).to.be.true;
        expect(stub.args[0][0]).to.equal(expectedScript);
      });

      it ('`webdriver executeAsyncScript` is called with the provided arguments', function () {
        expect(stub.args[0]).to.length(3);
        expect(stub.args[0][1]).to.equal('argument 1');
        expect(stub.args[0][2]).to.equal('argument 2');
      });
    });
  });

  describe('`syncFunction`', function () {
    describe('when called without arguments', function () {
      var syncFn, wbChrome, stub;

      before(function () {
        wbChrome = new seleniumWb.Builder()
        .withCapabilities(seleniumWb.Capabilities.chrome())
        .build();

        stub = sinon.stub(wbChrome, 'executeScript');
        syncFn = function () {  };
        rodsInjections.syncFunction(wbChrome, syncFn);
      });

      it('`webdriver executeScript` method is executed', function () {
        var expectedScript =
          ' var func = ' + syncFn.toString() + ';' +
          ' return func.apply(null, arguments);';

        expect(stub.calledOnce).to.be.true;
        expect(stub.args[0][0]).to.equal(expectedScript);
      });

      it ('`webdriver executeScript` is called without any argument more', function () {
        expect(stub.args[0]).to.length(1);
      });
    });

    describe('when called with arguments', function () {
      var syncFn, wbChrome, stub;

      before(function () {
        wbChrome = new seleniumWb.Builder()
        .withCapabilities(seleniumWb.Capabilities.chrome())
        .build();

        stub = sinon.stub(wbChrome, 'executeScript');
        syncFn = function () {  };
        rodsInjections.syncFunction(wbChrome, syncFn, 'argument 1', 'argument 2');
      });

      it('`webdriver executeScript` method is executed', function () {
        var expectedScript =
          ' var func = ' + syncFn.toString() + ';' +
          ' return func.apply(null, arguments);';

        expect(stub.calledOnce).to.be.true;
        expect(stub.args[0][0]).to.equal(expectedScript);
      });

      it ('`webdriver executeScript` is called with the provided arguments', function () {
        expect(stub.args[0]).to.length(3);
        expect(stub.args[0][1]).to.equal('argument 1');
        expect(stub.args[0][2]).to.equal('argument 2');
      });
    });
  });

  describe('`syncScriptBlock`', function () {
    describe('when called without arguments', function () {
      var scriptBlock, wbChrome, stub;

      before(function () {
        wbChrome = new seleniumWb.Builder()
        .withCapabilities(seleniumWb.Capabilities.chrome())
        .build();

        stub = sinon.stub(wbChrome, 'executeScript');
        scriptBlock = rodsHelpers.objectPropertiesToScriptBlock({
          execMe: function () {}
        });
        rodsInjections.syncScriptBlock(wbChrome, scriptBlock, 'execMe');
      });

      it('`webdriver executeScript` method is executed', function () {
        expect(stub.calledOnce).to.be.true;
        expect(stub.args[0][0]).to.match(/var execMe=function/);
        expect(stub.args[0][0]).to.match(/execMe\.apply\(null, arguments\);/);
      });

      it ('`webdriver executeScript` is called without any argument more', function () {
        expect(stub.args[0]).to.length(1);
      });
    });

    describe('when called with arguments', function () {
      var scriptBlock, wbChrome, stub;

      before(function () {
        wbChrome = new seleniumWb.Builder()
        .withCapabilities(seleniumWb.Capabilities.chrome())
        .build();

        stub = sinon.stub(wbChrome, 'executeScript');
        scriptBlock = rodsHelpers.objectPropertiesToScriptBlock({
          execMe: function () {}
        });
        rodsInjections.syncScriptBlock(wbChrome, scriptBlock, 'execMe', 'argument 1', 'argument 2');
      });

      it('`webdriver executeScript` method is executed', function () {
        expect(stub.calledOnce).to.be.true;
        expect(stub.args[0][0]).to.match(/var execMe=function/);
        expect(stub.args[0][0]).to.match(/execMe\.apply\(null, arguments\);/);
      });

      it ('`webdriver executeScript` is called with the provided arguments', function () {
        expect(stub.args[0]).to.length(3);
        expect(stub.args[0][1]).to.equal('argument 1');
        expect(stub.args[0][2]).to.equal('argument 2');
      });
    });
  });

  describe('`asyncScriptBlock`', function () {
    describe('when called without options and without arguments', function () {
      var scriptBlock, wbChrome, stub;

      before(function () {
        wbChrome = new seleniumWb.Builder()
        .withCapabilities(seleniumWb.Capabilities.chrome())
        .build();

        stub = sinon.stub(wbChrome, 'executeAsyncScript');
        scriptBlock = rodsHelpers.objectPropertiesToScriptBlock({
          execMe: function () {
            //done()
          }
        });
        rodsInjections.asyncScriptBlock(wbChrome, scriptBlock, 'execMe');
      });

      it('`webdriver executeAsyncScript` method is executed with a script that wraps the function and defines a variable called `done`', function () {
        var expectedScript =
          ' var scriptArgs = \\[\\]\\.slice\\.call\\(arguments, 0\\);' +
          ' var done = scriptArgs\\.pop\\(\\);' +
          ' execMe\\.apply\\(null, scriptArgs\\);';

        expect(stub.calledOnce).to.be.true;
        expect(stub.args[0][0]).to.match(new RegExp(expectedScript));
        expect(stub.args[0][0]).to.match(/var execMe=function \(\)/);
      });

      it ('`webdriver executeAsyncScript` is called without any argument more', function () {
        expect(stub.args[0]).to.length(1);
      });
    });

    describe('when called without options and with arguments', function () {
      var scriptBlock, wbChrome, stub;

      before(function () {
        wbChrome = new seleniumWb.Builder()
        .withCapabilities(seleniumWb.Capabilities.chrome())
        .build();

        stub = sinon.stub(wbChrome, 'executeAsyncScript');
        scriptBlock = rodsHelpers.objectPropertiesToScriptBlock({
          execMe: function () {
            //done()
          }
        });
        rodsInjections.asyncScriptBlock(wbChrome, scriptBlock, 'execMe', 'argument 1', 'argument 2');
      });

      it('`webdriver executeAsyncScript` method is executed with a script that wraps the function and defines a variable called `done`', function () {
        var expectedScript =
          ' var scriptArgs = \\[\\]\\.slice\\.call\\(arguments, 0\\);' +
          ' var done = scriptArgs\\.pop\\(\\);' +
          ' execMe\\.apply\\(null, scriptArgs\\);';

        expect(stub.calledOnce).to.be.true;
        expect(stub.args[0][0]).to.match(new RegExp(expectedScript));
        expect(stub.args[0][0]).to.match(/var execMe=function \(\)/);
      });

      it ('`webdriver executeAsyncScript` is called with the provided arguments', function () {
        expect(stub.args[0]).to.length(3);
        expect(stub.args[0][1]).to.equal('argument 1');
        expect(stub.args[0][2]).to.equal('argument 2');
      });
    });

    describe('when called with the option `callbackName` to "myDone" and without arguments', function () {
      var scriptBlock, wbChrome, stub;

      before(function () {
        wbChrome = new seleniumWb.Builder()
        .withCapabilities(seleniumWb.Capabilities.chrome())
        .build();

        stub = sinon.stub(wbChrome, 'executeAsyncScript');
        scriptBlock = rodsHelpers.objectPropertiesToScriptBlock({
          execMe: function () {
            //myDone()
          }
        });
        rodsInjections.asyncScriptBlock(wbChrome, { callbackName: 'myDone' }, scriptBlock, 'execMe');
      });

      it('`webdriver executeAsyncScript` method is executed with a script that wraps the function and defines a variable called `myDone`', function () {
        var expectedScript =
          ' var scriptArgs = \\[\\]\\.slice\\.call\\(arguments, 0\\);' +
          ' var myDone = scriptArgs\\.pop\\(\\);' +
          ' execMe\\.apply\\(null, scriptArgs\\);';

        expect(stub.calledOnce).to.be.true;
        expect(stub.args[0][0]).to.match(new RegExp(expectedScript));
        expect(stub.args[0][0]).to.match(/var execMe=function \(\)/);
      });

      it ('`webdriver executeAsyncScript` is called without any argument more', function () {
        expect(stub.args[0]).to.length(1);
      });
    });

    describe('when called with the option `callbackName` to "myDone" and with arguments', function () {
      var scriptBlock, wbChrome, stub;

      before(function () {
        wbChrome = new seleniumWb.Builder()
        .withCapabilities(seleniumWb.Capabilities.chrome())
        .build();

        stub = sinon.stub(wbChrome, 'executeAsyncScript');
        scriptBlock = rodsHelpers.objectPropertiesToScriptBlock({
          execMe: function () {
            //myDone()
          }
        });
        rodsInjections.asyncScriptBlock(wbChrome, { callbackName: 'myDone' }, scriptBlock, 'execMe', 'argument 1', 'argument 2');
      });

      it('`webdriver executeAsyncScript` method is executed with a script that wraps the function and defines a variable called `myDone`', function () {
        var expectedScript =
          ' var scriptArgs = \\[\\]\\.slice\\.call\\(arguments, 0\\);' +
          ' var myDone = scriptArgs\\.pop\\(\\);' +
          ' execMe\\.apply\\(null, scriptArgs\\);';

        expect(stub.calledOnce).to.be.true;
        expect(stub.args[0][0]).to.match(new RegExp(expectedScript));
        expect(stub.args[0][0]).to.match(/var execMe=function \(\)/);
      });

      it ('`webdriver executeAsyncScript` is called with the provided arguments', function () {
        expect(stub.args[0]).to.length(3);
        expect(stub.args[0][1]).to.equal('argument 1');
        expect(stub.args[0][2]).to.equal('argument 2');
      });
    });
  });
});

