'use strict';

var seleniumWb = require('selenium-webdriver');
var chai = require('chai');
var rodsHelpers = require('../../../lib/rods/browser/helpers');

describe('Browser rods\' helpers', function () {
  var expect = chai.expect;

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

      Object.defineProperty(objToScript, 'prop8', {
        enumerable: true,
        writable: false,
        value: 'static'
      });

      Object.defineProperty(objToScript, 'prop9', {
        enumerable: false,
        writable: false,
        value: 'invisible'
      });

      generatedScript = rodsHelpers.objectPropertiesToScriptBlock(objToScript);
    });

    it('generating a script which contains all the enumerable function properties as defined variables', function () {
      expect(generatedScript).to.match(/var prop1=/);
      expect(generatedScript).to.match(/var prop2=/);
      expect(generatedScript).to.match(/function prop2\(\)/);
    });

    it('generating a script which contains the string variables defined as strings', function () {
      expect(generatedScript).to.match(/var prop3='a string'/);
      expect(generatedScript).to.match(/var prop8='static'/);
    });

    it('generating a script which contains all the other types to their string representation ', function () {
      expect(generatedScript).to.match(/var prop4=10/);
      expect(generatedScript).to.match(/var prop5=\/regularExp\//);
      expect(generatedScript).to.match(/var prop6=\[object Object\]/);
      expect(generatedScript).to.match(new RegExp('var prop7=' + objToScript.prop7.toString()));
    });

    it('the generated script does not contain the non-enumerable properties', function () {
      expect(generatedScript).to.not.match(/var prop9='invisible'/);
    });
  });
});
