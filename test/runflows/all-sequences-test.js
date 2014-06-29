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

    it('finishes with the expected result', function (done) {
      allSequences.run(function* () {
        var result = yield {
          engine: engine,
          sequence: generateSequence(numSteps),
          arguments: [initNumber]
        };

        while (true) {
          if (result > 1500) {
            //Sending null, allows to allSequence run flow to release the event listener registered
            //to manage the sequences iteration
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

  describe('when a generator yields depending the previous yield\'s result but the first yield does not provided a sequence', function () {
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

    it('finishes with the expected result', function (done) {
      allSequences.run(function* () {
        var result = yield {
          engine: engine,
          arguments: [initNumber]
        };

        while (true) {
          if (result === null) {
            result = initNumber;
          }

          result = yield {
            sequence: generateSequence(numSteps),
            arguments: [result]
          };

          if (result > 1500) {
            //Sending null, allows to allSequence run flow to release the event listener registered
            //to manage the sequences iteration
            yield null;
            break;
          }
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

  describe('when a step of one of the sequences produce an error', function () {
    function fakeStep(generator, browser, number) {
      iterNum++;

      setImmediate(function () {
        if (maxIter < iterNum) {
          generator.throw('Max interation reached');
          return;
        }
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
    var maxIter = Math.random() * 10 + numSteps;
    var iterNum = 0;

    it('generator function get the error', function (done) {
      allSequences.run(function* () {
        var result = yield {
          engine: engine,
          sequence: generateSequence(numSteps),
          arguments: [initNumber]
        };

        try {
          while (true) {
            if (iterNum > maxIter) {
              //Sending null, allows to allSequence run flow to release the event listener registered
              //to manage the sequences iteration
              yield null;
              break;
            }

            result = yield {
              sequence: generateSequence(numSteps),
              arguments: [result]
            };
          }
        } catch (e) {
          done();
          return;
        }

        done(new Error('The error has been throw to the generator function'));
      });
    });
  });
});
