'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinonChai = require('sinon-chai');
var rewire = require('rewire');

var mockLogFactory = require('../../fixtures/mockLogFactory');
var mockColorsFactory = require('../../fixtures/mockColorsFactory');

var timer = rewire('../../../lib/utils/timer');

chai.use(sinonChai);

describe('utils.timer.start()', function() {
	var mockLog = mockLogFactory();
	var resetMockLog;
	before(function() {
		resetMockLog = timer.__set__('log', mockLog);
	});

	afterEach(function() {
		mockLog.reset();
	});

	after(function() {
		resetMockLog();
	});

	it('should return a token', function() {
		var expected, actual;
		expected = 'string';
		actual = timer.start();
		expect(actual).to.be.a(expected);
	});

	it('should log to console if label is set to true', function() {
		timer.start(true);

		var expected = 'Timer started';
		expect(mockLog.debug).to.have.been.calledOnce;
		expect(mockLog.debug).to.have.been.calledWith(expected);
	});

	it('should log to console if a label is specified', function() {
		timer.start('timer-start');

		var expected = 'Timer started: "timer-start"';
		expect(mockLog.debug).to.have.been.calledOnce;
		expect(mockLog.debug).to.have.been.calledWith(expected);
	});

	it('should log to console if an empty label is specified', function() {
		timer.start('');

		var expected = 'Timer started';
		expect(mockLog.debug).to.have.been.calledOnce;
		expect(mockLog.debug).to.have.been.calledWith(expected);
	});

	it('should not log to console if no label is specified', function() {
		timer.start();
		timer.start(undefined);
		timer.start(null);
		timer.start(false);

		expect(mockLog.debug).not.to.have.been.called;
	});
});

describe('api.utils.timer.end()', function() {
	var mockLog = mockLogFactory();
	var mockColors = mockColorsFactory();
	var resetMockLog;
	var resetMockColors;
	before(function() {
		resetMockLog = timer.__set__('log', mockLog);
		resetMockColors = timer.__set__('colors', mockColors);
	});

	afterEach(function() {
		mockLog.reset();
	});

	after(function() {
		resetMockLog();
		resetMockColors();
	});


	it('should throw an error if no token is specified', function() {
		var expected, actual;
		expected = Error;
		actual = [
			function() { return timer.end(); },
			function() { return timer.end(undefined); },
			function() { return timer.end(null); },
			function() { return timer.end(false); },
			function() { return timer.end(''); }
		];
		actual.forEach(function(actual) {
			expect(actual).to.throw(expected);
		});
	});

	it('should throw an error if an invalid token is specified', function() {
		var expected, actual;
		expected = Error;
		actual = [
			function() { return timer.end(0); },
			function() { return timer.end(1); },
			function() { return timer.end('non-existent-token'); }
		];
		actual.forEach(function(actual) {
			expect(actual).to.throw(expected);
		});
	});

	it('should return and log the elapsed time if a label is specified', function(done) {
		var timeoutDuration = 100;

		var token = timer.start();

		setTimeout(function() {
			try {
				var returnValue = timer.end(token, 'timer-end');

				var expected, actual;
				var tolerance = 10;

				expected = timeoutDuration;
				actual = returnValue;
				expect(actual).to.be.closeTo(expected, tolerance);

				expect(mockLog.debug).to.have.been.calledOnce;

				actual = mockLog.debug.firstCall.args;
				expected = [
					'Timer ended: "timer-end" (elapsed time: <time>' + Math.ceil(returnValue) + 'ms</time>)'
				];
				expect(actual).to.eql(expected);


				done();
			} catch (error) {
				done(error);
			}
		}, timeoutDuration);
	});

	it('should suppress logging if no label is specified', function() {
		var token = timer.start();
		timer.end(token);
		expect(mockLog.debug).not.to.have.been.called;
	});

	it('should throw an error if a token is reused', function() {
		var expected, actual;
		expected = Error;
		actual = function() {
			var token = timer.start();
			timer.end(token);
			timer.end(token);
		};
		expect(actual).to.throw(expected);
	});
});
