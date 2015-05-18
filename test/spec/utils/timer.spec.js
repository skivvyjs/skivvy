'use strict';

var chai = require('chai');
var expect = chai.expect;

var mockCli = require('../../utils/mock-cli');
var sharedTests = require('./sharedTests');

var timer = require('../../../lib/utils/timer');


describe('utils.timer.start()', function() {
	var unmockCli = null;
	afterEach(function() {
		if (unmockCli) {
			unmockCli();
			unmockCli = null;
		}
	});

	it('should return a token', function() {
		var expected, actual;
		expected = 'string';
		actual = timer.start();
		expect(actual).to.be.a(expected);
	});

	it('should log to console if label is set to true', function() {
		sharedTests.testLogOutput({
			actual: function() { timer.start(true); },
			expected: 'Timer started'
		});
	});

	it('should log to console if a label is specified', function() {
		sharedTests.testLogOutput({
			actual: function() { timer.start('timer-start'); },
			expected: 'Timer started: "timer-start"'
		});
	});

	it('should not log to console if no label is specified', function() {
		sharedTests.testLogOutput({
			actual: function() { timer.start(); },
			expected: null
		});
	});

	it('should not log to console if label is set to false', function() {
		sharedTests.testLogOutput({
			actual: function() { timer.start(false); },
			expected: null
		});
	});
});

describe('api.utils.timer.end()', function() {
	var unmockCli = null;
	afterEach(function() {
		if (unmockCli) {
			unmockCli();
			unmockCli = null;
		}
	});

	it('should throw an error if no token is specified', function() {
		var actual, expected;
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
		var actual, expected;
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
		var actual, expected;
		var timeoutDuration = 100;
		var tolerance = 10;
		expected = timeoutDuration;

		var token = timer.start();

		setTimeout(function() {
			try {
				actual = sharedTests.testLogOutput({
					actual: function() {
						return timer.end(token, 'timer-end');
					},
					expected: function(actual) {
						return 'Timer ended: "timer-end" (elapsed time: ' + Math.ceil(actual) + 'ms)';
					}
				});

				expect(actual).to.be.closeTo(expected, tolerance);

				done();
			} catch (error) {
				done(error);
			}
		}, timeoutDuration);
	});

	it('should suppress logging if no label is specified', function() {
		var token = timer.start();

		var argv = ['node', 'script.js'];
		unmockCli = mockCli(argv);

		timer.end(token);

		var cli = unmockCli();
		unmockCli = null;

		var expected, actual;
		expected = '';
		actual = cli.stdout;
		expect(actual).to.equal(expected);
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
