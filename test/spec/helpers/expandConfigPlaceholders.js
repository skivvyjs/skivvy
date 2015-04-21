'use strict';

var chai = require('chai');
var expect = chai.expect;

var expandConfigPlaceholders = require('../../../lib/helpers/expandConfigPlaceholders');

describe('helpers.expandConfigPlaceholders()', function() {
	it('should handle no placeholders and return a copy', function() {
		var input, expected, actual;

		input = {
			template: {
				message: 'Hello, world!'
			},
			context: {}
		};
		expected = {
			message: 'Hello, world!'
		};
		actual = expandConfigPlaceholders(input.template, input.context);
		expect(actual).to.eql(expected);
		expect(actual).not.to.equal(input.template);

		input = {
			template: {
				message: 'Hello, world!'
			},
			context: null
		};
		expected = {
			message: 'Hello, world!'
		};
		actual = expandConfigPlaceholders(input.template, input.context);
		expect(actual).to.eql(expected);
		expect(actual).not.to.equal(input.template);
	});

	it('should expand placeholders and return a copy', function() {
		var input, expected, actual;

		input = {
			template: {
				message: 'Hello, <%= user %>!'
			},
			context: {
				user: 'world'
			}
		};
		expected = {
			message: 'Hello, world!'
		};
		actual = expandConfigPlaceholders(input.template, input.context);
		expect(actual).to.eql(expected);
		expect(actual).not.to.equal(input.template);
	});

	it('should expand nested placeholders', function() {
		var input, expected, actual;

		input = {
			template: {
				message: 'Hello, <%= user.name %>!'
			},
			context: {
				user: {
					name: 'world'
				}
			}
		};
		expected = {
			message: 'Hello, world!'
		};
		actual = expandConfigPlaceholders(input.template, input.context);
		expect(actual).to.eql(expected);
	});

	it('should throw errors for invalid placeholders', function() {
		var input, expected, actual;

		input = {
			template: {
				message: 'Hello, <%= user %>!'
			},
			context: {
			}
		};
		expected = Error;
		actual = function() {
			return expandConfigPlaceholders(input.template, input.context);
		};
		expect(actual).to.throw(expected);

		input = {
			template: {
				message: 'Hello, <%= user %>!'
			},
			context: null
		};
		expected = Error;
		actual = function() {
			return expandConfigPlaceholders(input.template, input.context);
		};
		expect(actual).to.throw(expected);
	});
});
