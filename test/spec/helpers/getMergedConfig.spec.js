'use strict';

var chai = require('chai');
var expect = chai.expect;

var getMergedConfig = require('../../../lib/helpers/getMergedConfig');

describe('helpers.getMergedConfig', function() {

	it('should return a copy of the base config object', function() {
		var expected, actual;
		var input = { a: 1 };
		actual = getMergedConfig(input);
		expected = {
			a: 1
		};
		expect(actual).to.eql(expected);
		expect(actual).not.to.equal(input);
	});

	it('should merge the config objects', function() {
		var expected, actual;
		actual = getMergedConfig(
			{ a: 1 },
			{ b: 2 },
			{ c: 3 }
		);
		expected = {
			a: 1,
			b: 2,
			c: 3
		};
		expect(actual).to.eql(expected);
	});

	it('should successively override config', function() {
		var expected, actual;
		actual = getMergedConfig(
			{ a: 0 },
			{ a: 1, b: 1 },
			{ b: 2, c: 3 }
		);
		expected = {
			a: 1,
			b: 2,
			c: 3
		};
		expect(actual).to.eql(expected);
	});

	it('should skip empty values', function() {
		var expected, actual;
		actual = getMergedConfig(
			undefined,
			{ a: 1 },
			null,
			{ b: 2 },
			false,
			{ c: 3 }
		);
		expected = {
			a: 1,
			b: 2,
			c: 3
		};
		expect(actual).to.eql(expected);
	});
});
