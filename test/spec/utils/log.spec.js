'use strict';

var sharedTests = require('./sharedTests');

var log = require('../../../lib/utils/log');

describe('utils.log()', function() {

	var unmockCli = null;
	afterEach(function() {
		if (unmockCli) {
			unmockCli();
			unmockCli = null;
		}
	});

	it('should log the current time if no arguments are specified', function() {
		sharedTests.testLogOutput({
			actual: function() { log(''); },
			expected: ''
		});
	});

	it('should log the message prefixed with the current time if one argument is specified', function() {
		sharedTests.testLogOutput({
			actual: function() { log('Hello, world!'); },
			expected: 'Hello, world!'
		});
	});

	it('should join multiple arguments together prefixed with the current time', function() {
		sharedTests.testLogOutput({
			actual: function() { log('Hello,', 'world!'); },
			expected: 'Hello, world!'
		});
	});
});
