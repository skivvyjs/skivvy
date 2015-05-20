'use strict';

var chai = require('chai');
var expect = chai.expect;
var escapeRegexp = require('escape-regexp');
var rewire = require('rewire');

var mockCli = require('../../utils/mock-cli');
var mockColorsFactory = require('../../fixtures/mockColorsFactory');
var LOG_TEMPLATE = require('../../../lib/utils/constants').LOG_TEMPLATE;

var log = rewire('../../../lib/utils/log');

describe('utils.log()', function() {
	var unmockCli = null;
	var mockColors = mockColorsFactory();
	var resetColors;

	before(function() {
		resetColors = log.__set__('colors', mockColors);
	});

	afterEach(function() {
		if (unmockCli) {
			unmockCli();
			unmockCli = null;
		}
	});

	after(function() {
		resetColors();
	});

	it('should log the current time if no arguments are specified', function() {
		var args = [];
		var expectedOutput = '';
		testLogOutput(log, args, expectedOutput);
	});

	it('should log the message prefixed with the current time if one argument is specified', function() {
		var args = ['Hello, world!'];
		var expectedOutput = 'Hello, world!';
		testLogOutput(log, args, expectedOutput);
	});

	it('should join multiple arguments together prefixed with the current time', function() {
		var args = ['Hello,', 'world!'];
		var expectedOutput = 'Hello, world!';
		testLogOutput(log, args, expectedOutput);
	});

	it('should log debug messags', function() {
		var args, expectedOutput;
		args = [];
		expectedOutput = '<debug></debug>';
		testLogOutput(log.debug, args, expectedOutput);

		args = ['Hello, world!'];
		expectedOutput = '<debug>Hello, world!</debug>';
		testLogOutput(log.debug, args, expectedOutput);

		args = ['Hello,', 'world!'];
		expectedOutput = '<debug>Hello, world!</debug>';
		testLogOutput(log.debug, args, expectedOutput);
	});

	it('should log info messags', function() {
		var args, expectedOutput;
		args = [];
		expectedOutput = '<info></info>';
		testLogOutput(log.info, args, expectedOutput);

		args = ['Hello, world!'];
		expectedOutput = '<info>Hello, world!</info>';
		testLogOutput(log.info, args, expectedOutput);

		args = ['Hello,', 'world!'];
		expectedOutput = '<info>Hello, world!</info>';
		testLogOutput(log.info, args, expectedOutput);
	});

	it('should log warning messags', function() {
		var args, expectedOutput;
		args = [];
		expectedOutput = '<warning></warning>';
		testLogOutput(log.warn, args, expectedOutput);

		args = ['Hello, world!'];
		expectedOutput = '<warning>Hello, world!</warning>';
		testLogOutput(log.warn, args, expectedOutput);

		args = ['Hello,', 'world!'];
		expectedOutput = '<warning>Hello, world!</warning>';
		testLogOutput(log.warn, args, expectedOutput);
	});

	it('should log error messags', function() {
		var args, expectedOutput;
		args = [];
		expectedOutput = '<error></error>';
		testLogOutput(log.error, args, expectedOutput);

		args = ['Hello, world!'];
		expectedOutput = '<error>Hello, world!</error>';
		testLogOutput(log.error, args, expectedOutput);

		args = ['Hello,', 'world!'];
		expectedOutput = '<error>Hello, world!</error>';
		testLogOutput(log.error, args, expectedOutput);
	});

	it('should log success messags', function() {
		var args, expectedOutput;
		args = [];
		expectedOutput = '<success></success>';
		testLogOutput(log.success, args, expectedOutput);

		args = ['Hello, world!'];
		expectedOutput = '<success>Hello, world!</success>';
		testLogOutput(log.success, args, expectedOutput);

		args = ['Hello,', 'world!'];
		expectedOutput = '<success>Hello, world!</success>';
		testLogOutput(log.success, args, expectedOutput);
	});


	function testLogOutput(fn, args, expectedOutput) {
		var unmockCli, returnValue, expectedTimestamp;
		try {
			var argv = ['node', 'script.js'];
			unmockCli = mockCli(argv);
			expectedTimestamp = Date.now();
			returnValue = fn.apply(null, args);
		} catch (error) {
			if (unmockCli) { unmockCli(); }
			throw error;
		}

		var cli = unmockCli();
		var stdout = cli.stdout;

		if (expectedOutput === null) {
			expect(stdout).to.equal('');
		} else {
			var timestampTolerance = 50;
			testLogMessage(stdout, expectedOutput, expectedTimestamp, timestampTolerance);
		}

		return returnValue;


		function testLogMessage(actual, expectedMessage, expectedTimestamp, timestampTolerance) {
			var timestampRegExp = /(\d\d):(\d\d):(\d\d)\.(\d\d\d)/;
			var expected = getExpectedRegExp(expectedMessage);
			expect(actual).to.match(expected);
			var results = expected.exec(actual);
			var expectedDate = new Date(expectedTimestamp);
			var actualDate = new Date(expectedDate.getFullYear(), expectedDate.getMonth(), expectedDate.getDate(), results[1], results[2], results[3], results[4]);
			var actualTimestamp = actualDate.getTime();
			expect(actualTimestamp).to.be.closeTo(expectedTimestamp, timestampTolerance);

			function getExpectedRegExp(expectedMessage) {
				return new RegExp('^' + getExpectedRegExpBody(expectedMessage) + '$');

				function getExpectedRegExpBody(message) {
					var messages = Array.isArray(message) ? message : [message];
					return messages.map(function(message) {
						return escapeRegexp(LOG_TEMPLATE)
							.replace(escapeRegexp('${timestamp}'), timestampRegExp.source)
							.replace(escapeRegexp('${message}'), escapeRegexp(message)) +
							escapeRegexp('\n');
					}).join('');
				}
			}
		}
	}
});
