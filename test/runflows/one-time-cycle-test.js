'use strict';

var Engine = require('../../lib/engine');
var oneTimeCycle = require('../../lib/runflows').oneTimeCycle;
var chai = require('chai');

describe('Run flow "one-time-cycle"', function () {
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
      oneTimeCycle.run(function* () {
        done();
      });
      /* jshint noyield: false */
    });
  });

  describe('when generator has a yield', function () {
    function fakeStep(generator, browser, number) {
      setImmediate(function () {
        generator.next(number * 2);
      });
    }

    var numSteps = 3;
    var steps = [];
    var initNumber = 10;
    var expectedResult = initNumber;

    before(function () {
      for (let si = 0; si < numSteps; si++) {
        steps.push(fakeStep);
        expectedResult *= 2;
      }
    });

    it('finishes with the expected result', function (done) {
      oneTimeCycle.run(function* () {
        var result = yield {
          engine: engine,
          sequence: steps,
          arguments: initNumber
        };

        try {
          expect(result).to.equal(expectedResult);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });

  describe('when generator has more than one yield', function () {
    function fakeStep(generator, browser, number) {
      setImmediate(function () {
        generator.next(number * 2);
      });
    }

    var numSteps = 3;
    var steps = [];
    var initNumber = 10;
    var expectedResult = initNumber;

    before(function () {
      for (let si = 0; si < numSteps; si++) {
        steps.push(fakeStep);
        expectedResult *= 2;
      }
    });

    it('it never finishes', function (done) {
      this.timeout(3000);
      setTimeout(function () {
        //timeout resolve the generator which waits infinitely
        done();
      }, 2999);

      oneTimeCycle.run(function* () {
        var result = yield {
          engine: engine,
          sequence: steps,
          arguments: initNumber
        };

        yield null;
        done(new Error('Second yiel has been resolved, and it must not'));
      });
    });
  });

  describe('stop the execution when an error is thrown', function () {
    function fakeStep(generator, browser, number) {
      setImmediate(function () {
        if (number > stopWhenGt) {
          generator.throw(new Error('Error when number is ' + number));
        } else {
          generator.next(number * 2);
        }
      });
    }

    var stopWhenGt = 20;
    var numSteps = 3;
    var steps = [];
    var initNumber = 10;
    var expectedResult = initNumber;

    before(function () {
      for (let si = 0; si < numSteps; si++) {
        steps.push(fakeStep);

        if (expectedResult <= stopWhenGt) {
          expectedResult *= 2;
        }
      }
    });

    it('receiving it in the generator scope', function (done) {
      oneTimeCycle.run(function* () {
        try {
          var result = yield {
            engine: engine,
            sequence: steps,
            arguments: initNumber
          };

          done(new Error('It is expected that an Error be thrown but it was not'));
        } catch (expectedError) {
          expect(expectedError.message).to.equal('Error when number is ' + expectedResult);
          done();
        }
      });
    });
  });
});
