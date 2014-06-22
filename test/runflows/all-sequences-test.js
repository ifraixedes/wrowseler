'use strict';

var Engine = require('../../lib/engine');
var allSequences= require('../../lib/runflows').allSequences;
var chai = require('chai');

describe('Run flow "allSequences"', function () {
  var expect = chai.expect;
  var engine;

  before(function () {
    engine = new Engine({
      switchOn: true,
      browser: {}
    });
  });

  describe('when generator does not have any yield', function () {
    it('ends straightaway', function (done) {
      /* jshint noyield: true */
      allSequences.run(function* () {
        done();
      });
      /* jshint noyield: false */
    });
  });

  describe('when a generator yields depending the previous yield\'s result', function () {
    function fakeStep(generator, browser, number) {
      setImmediate(function () {
        generator.next(number * 2);
      });
    }

    function generateSequence(numSteps) {
      var steps = [];
      for (let si = 0; si < numSteps; si++) {
        steps.push(fakeStep);
        expectedResult *= 2;
      }

      return steps;
    }

    var numSteps = 3;
    var initNumber = 10;
    var expectedResult = initNumber;

    it('when task finishes, it returns an object with task\'s id and results', function (done) {
      allSequences.run(function* () {
        var result = yield {
          engine: engine,
          sequence: generateSequence(numSteps),
          arguments: [initNumber]
        };

        while (true) {
          if (result > 500) {
            yield null;
            break;
          }

          result = yield {
            sequence: generateSequence(numSteps),
            arguments: [result]
          };
        }

        try {
          expect(result).to.equal(expectedResult);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

});
