'use strict';

var chai = require('chai');
var expect = chai.expect;

var normalizeArgs = require('../../../lib/helpers/normalizeArgs');

describe('helpers.normalizeArgs()', function() {
	var defaultArgs = ['node', 'script.js'];

	it('should handle standard option style', function() {
		var input, expected, actual;

		input = defaultArgs.concat([
			'--hello', 'hello',
			'--message', 'hello world',
			'--zero', '0',
			'--one', '1',
			'--two', '2',
			'--yes', 'true',
			'--no', 'false',
			'--array', 'hello',
			'--array', 'hello world',
			'--array', '0',
			'--array', '1',
			'--array', '2',
			'--array', 'true',
			'--array', 'false',
			'--nested.hello', 'hello',
			'--nested.message', 'hello world',
			'--nested.zero', '0',
			'--nested.one', '1',
			'--nested.two', '2',
			'--nested.yes', 'true',
			'--nested.no', 'false',
			'--nested.array', 'hello',
			'--nested.array', 'hello world',
			'--nested.array', '0',
			'--nested.array', '1',
			'--nested.array', '2',
			'--nested.array', 'true',
			'--nested.array', 'false',
			'file1',
			'file2',
			'file3'
		]);
		expected = defaultArgs.concat([
			'--hello', 'hello',
			'--message', 'hello world',
			'--zero', 0,
			'--one', 1,
			'--two', 2,
			'--yes', true,
			'--no', false,
			'--array', [
				'hello',
				'hello world',
				0,
				1,
				2,
				true,
				false
			],
			'--nested', {
				hello: 'hello',
				message: 'hello world',
				zero: 0,
				one: 1,
				two: 2,
				yes: true,
				no: false,
				array: [
					'hello',
					'hello world',
					0,
					1,
					2,
					true,
					false
				]
			},
			'file1',
			'file2',
			'file3'
		]);
		actual = normalizeArgs(input);
		expect(actual).to.eql(expected);
	});

	it('should handle equals option style', function() {
		var input, expected, actual;

		input = defaultArgs.concat([
			'--hello=hello',
			'--message=hello world',
			'--zero=0',
			'--one=1',
			'--two=2',
			'--yes=true',
			'--no=false',
			'--array=hello',
			'--array=hello world',
			'--array=0',
			'--array=1',
			'--array=2',
			'--array=true',
			'--array=false',
			'--nested.hello=hello',
			'--nested.message=hello world',
			'--nested.zero=0',
			'--nested.one=1',
			'--nested.two=2',
			'--nested.yes=true',
			'--nested.no=false',
			'--nested.array=hello',
			'--nested.array=hello world',
			'--nested.array=0',
			'--nested.array=1',
			'--nested.array=2',
			'--nested.array=true',
			'--nested.array=false',
			'file1',
			'file2',
			'file3'
		]);
		expected = defaultArgs.concat([
			'--hello', 'hello',
			'--message', 'hello world',
			'--zero', 0,
			'--one', 1,
			'--two', 2,
			'--yes', true,
			'--no', false,
			'--array', [
				'hello',
				'hello world',
				0,
				1,
				2,
				true,
				false
			],
			'--nested', {
				hello: 'hello',
				message: 'hello world',
				zero: 0,
				one: 1,
				two: 2,
				yes: true,
				no: false,
				array: [
					'hello',
					'hello world',
					0,
					1,
					2,
					true,
					false
				]
			},
			'file1',
			'file2',
			'file3'
		]);
		actual = normalizeArgs(input);
		expect(actual).to.eql(expected);
	});

	it('should handle short option style', function() {
		var input, expected, actual;

		input = defaultArgs.concat([
			'-h', 'hello',
			'-m', 'hello world',
			'-z', '0',
			'-o', '1',
			'-t', '2',
			'-y', 'true',
			'-n', 'false',
			'-a', 'hello',
			'-a', 'hello world',
			'-a', '0',
			'-a', '1',
			'-a', '2',
			'-a', 'true',
			'-a', 'false',
			'file1',
			'file2',
			'file3'
		]);
		expected = defaultArgs.concat([
			'-h', 'hello',
			'-m', 'hello world',
			'-z', 0,
			'-o', 1,
			'-t', 2,
			'-y', true,
			'-n', false,
			'-a', [
				'hello',
				'hello world',
				0,
				1,
				2,
				true,
				false
			],
			'file1',
			'file2',
			'file3'
		]);
		actual = normalizeArgs(input);
		expect(actual).to.eql(expected);
	});
});
