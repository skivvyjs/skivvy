'use strict';

var chai = require('chai');
var expect = chai.expect;
var rewire = require('rewire');

var mockChalkFactory = require('../../fixtures/mockChalkFactory');
var colors = rewire('../../../lib/utils/colors');

describe('utils.colors', function() {
	var mockChalk = mockChalkFactory();
	var resetChalk;
	before(function() {
		resetChalk = colors.__set__('chalk', mockChalk);
	});

	after(function() {
		resetChalk();
	});

	it('should format debug messages', function() {
		var expected, actual;
		actual = colors.debug('Hello, world!');
		expected = '<black>Hello, world!</black>';
		expect(actual).to.equal(expected);
	});

	it('should format info messages', function() {
		var expected, actual;
		actual = colors.info('Hello, world!');
		expected = '<black>Hello, world!</black>';
		expect(actual).to.equal(expected);
	});

	it('should format warning messages', function() {
		var expected, actual;
		actual = colors.warning('Hello, world!');
		expected = '<yellow>Hello, world!</yellow>';
		expect(actual).to.equal(expected);
	});

	it('should format error messages', function() {
		var expected, actual;
		actual = colors.error('Hello, world!');
		expected = '<red>Hello, world!</red>';
		expect(actual).to.equal(expected);
	});

	it('should format success messages', function() {
		var expected, actual;
		actual = colors.success('Hello, world!');
		expected = '<bold>Hello, world!</bold>';
		expect(actual).to.equal(expected);
	});


	it('should format path strings', function() {
		var expected, actual;
		actual = colors.path('Hello, world!');
		expected = '<magenta>Hello, world!</magenta>';
		expect(actual).to.equal(expected);
	});

	it('should format package strings', function() {
		var expected, actual;
		actual = colors.package('Hello, world!');
		expected = '<magenta>Hello, world!</magenta>';
		expect(actual).to.equal(expected);
	});

	it('should format task strings', function() {
		var expected, actual;
		actual = colors.task('Hello, world!');
		expected = '<magenta>Hello, world!</magenta>';
		expect(actual).to.equal(expected);
	});

	it('should format time strings', function() {
		var expected, actual;
		actual = colors.time('Hello, world!');
		expected = '<dim>Hello, world!</dim>';
		expect(actual).to.equal(expected);
	});
});
