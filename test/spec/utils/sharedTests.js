'use strict';

var chai = require('chai');
var expect = chai.expect;
var escapeRegexp = require('escape-regexp');

var mockCli = require('../../utils/mock-cli');
var LOG_TEMPLATE = require('../../../lib/utils/constants').LOG_TEMPLATE;


exports.testLogOutput = function(options) {
	var fn = options.actual;
	var expected = options.expected;

	var unmockCli, returnValue, expectedTimestamp;
	try {
		var argv = ['node', 'script.js'];
		unmockCli = mockCli(argv);
		expectedTimestamp = Date.now();
		returnValue = fn.call();
	} catch (error) {
		if (unmockCli) { unmockCli(); }
		throw error;
	}

	var cli = unmockCli();
	var stdout = cli.stdout;

	if (expected === null) {
		expect(stdout).to.equal('');
	} else {
		var expectedMessage = (typeof expected === 'function' ? expected(returnValue) : expected);
		var timestampTolerance = 50;
		testLogMessage(stdout, expectedMessage, expectedTimestamp, timestampTolerance);
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
};
