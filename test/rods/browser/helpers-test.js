'use strict';

var seleniumWb = require('selenium-webdriver');
var chai = require('chai');
var sinon = require('sinon');
var rods = require('../../../lib/rods/browser');

describe('Browser rods base functions', function () {
  var expect = chai.expect;

  describe('`injectAsyncScript`', function () {
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
        rods.injectAsyncScript(wbChrome, asyncFn);
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
        rods.injectAsyncScript(wbChrome, asyncFn, 'argument 1', 'argument 2');
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
        rods.injectAsyncScript(wbChrome, { callbackName: 'myDone' }, asyncFn);
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
        rods.injectAsyncScript(wbChrome, { callbackName: 'myDone' }, asyncFn, 'argument 1', 'argument 2');
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

  describe('`injectScript`', function () {
    describe('when called without arguments', function () {
      var syncFn, wbChrome, stub;

      before(function () {
        wbChrome = new seleniumWb.Builder()
        .withCapabilities(seleniumWb.Capabilities.chrome())
        .build();

        stub = sinon.stub(wbChrome, 'executeScript');
        syncFn = function () {  };
        rods.injectScript(wbChrome, syncFn);
      });

      it('`webdriver executeScript` method is executed', function () {
        var expectedScript =
          ' var func = ' + syncFn.toString() + ';' +
          ' func.apply(null, arguments);';

        expect(stub.calledOnce).to.be.true;
        expect(stub.args[0][0]).to.equal(expectedScript);
      });

      it ('`webdriver executeScript` is called without any argument more', function () {
        expect(stub.args[0]).to.length(1);
      });
    });

    describe('when called without options and with arguments', function () {
      var syncFn, wbChrome, stub;

      before(function () {
        wbChrome = new seleniumWb.Builder()
        .withCapabilities(seleniumWb.Capabilities.chrome())
        .build();

        stub = sinon.stub(wbChrome, 'executeScript');
        syncFn = function () {  };
        rods.injectScript(wbChrome, syncFn, 'argument 1', 'argument 2');
      });

      it('`webdriver executeScript` method is executed', function () {
        var expectedScript =
          ' var func = ' + syncFn.toString() + ';' +
          ' func.apply(null, arguments);';

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

  describe('`objectPropertiesToScript` transform to script all the enumerable properties of an object', function () {
    var objToScript, generatedScript; 

    before(function () {
      var prop7Value = {
        name: 'test',
        toString: function () { return JSON.stringify(this); }
      };

      objToScript = {
        prop1: function () { return 'prop1'; },
        prop2: function prop2() { return 'prop2'; },
        prop3: 'a string',
        prop4: 10,
        prop5: /regularExp/,
        prop6: {},
        prop7: prop7Value
      };

      generatedScript = rods.objectPropertiesToScript(objToScript);
    });

    it('generating a script which contains all the enumerable function properties as defined variables', function () {
      expect(generatedScript).to.match(/var prop1=/);
      expect(generatedScript).to.match(/var prop2=/);
      expect(generatedScript).to.match(/function prop2\(\)/);
    });

    it('generating a script which contains the string variables defined as strings', function () {
      expect(generatedScript).to.match(/var prop3='a string'/);
    });

    it('generating a script which contains all the other types to their string representation ', function () {
      expect(generatedScript).to.match(/var prop4=10/);
      expect(generatedScript).to.match(/var prop5=\/regularExp\//);
                                       expect(generatedScript).to.match(/var prop6=\[object Object\]/);
      expect(generatedScript).to.match(new RegExp('var prop7=' + objToScript.prop7.toString()));
    });
  });
});

