'use strict';

var chai = require('chai');
var expect = chai.expect;

var parseArgs = require('../../../lib/helpers/parseArgs');

describe('helpers.parseArgs()', function() {
	var defaultArgs = ['node', 'script.js'];

	it('should handle no options', function() {
		var input, expected, actual;

		input = defaultArgs.concat([]);
		expected = {};
		actual = parseArgs(input);
		expect(actual).to.eql(expected);
	});

	it('should handle string options', function() {
		var input, expected, actual;

		input = defaultArgs.concat(['--hello', 'hello']);
		expected = { hello: 'hello' };
		actual = parseArgs(input);
		expect(actual).to.eql(expected);

		input = defaultArgs.concat(['--message', 'hello world']);
		expected = { message: 'hello world' };
		actual = parseArgs(input);
		expect(actual).to.eql(expected);
	});

	it('should handle number options', function() {
		var input, expected, actual;

		input = defaultArgs.concat(['--zero', '0']);
		expected = { zero: 0 };
		actual = parseArgs(input);
		expect(actual).to.eql(expected);

		input = defaultArgs.concat(['--one', '1']);
		expected = { one: 1 };
		actual = parseArgs(input);
		expect(actual).to.eql(expected);

		input = defaultArgs.concat(['--two', '2']);
		expected = { two: 2 };
		actual = parseArgs(input);
		expect(actual).to.eql(expected);
	});

	it('should handle boolean options', function() {
		var input, expected, actual;

		input = defaultArgs.concat(['--yes', 'true']);
		expected = { yes: true };
		actual = parseArgs(input);
		expect(actual).to.eql(expected);

		input = defaultArgs.concat(['--no', 'false']);
		expected = { no: false };
		actual = parseArgs(input);
		expect(actual).to.eql(expected);
	});

	it('should parse JSON string options', function() {
		var input, expected, actual;

		var example = {
			hello: 'hello',
			message: 'hello world',
			zero: 0,
			one: 1,
			two: 2,
			yes: true,
			no: false
		};
		var exampleJson = JSON.stringify(example);

		input = defaultArgs.concat(['--json', exampleJson]);
		expected = { json: example };
		actual = parseArgs(input);
		expect(actual).to.eql(expected);

		example = [1, 2, 3];
		exampleJson = JSON.stringify(example);

		input = defaultArgs.concat(['--json', exampleJson]);
		expected = { json: example };
		actual = parseArgs(input);
		expect(actual).to.eql(expected);

	});

	it('should handle malformed JSON string options as strings', function() {
		var input, expected, actual;

		var example = {
			hello: 'hello',
			message: 'hello world',
			zero: 0,
			one: 1,
			two: 2,
			yes: true,
			no: false
		};
		var exampleJson = JSON.stringify(example);
		var malformedJson = exampleJson.substr(0, exampleJson.length - 1);

		input = defaultArgs.concat(['--json', malformedJson]);
		expected = { json: malformedJson };
		actual = parseArgs(input);
		expect(actual).to.eql(expected);

		example = [1, 2, 3];
		exampleJson = JSON.stringify(example);
		malformedJson = exampleJson.substr(0, exampleJson.length - 1);

		input = defaultArgs.concat(['--json', malformedJson]);
		expected = { json: malformedJson };
		actual = parseArgs(input);
		expect(actual).to.eql(expected);
	});

	it('should handle array options', function() {
		var input, expected, actual;

		input = defaultArgs.concat([
			'--array', 'hello',
			'--array', 'hello world',
			'--array', '0',
			'--array', '1',
			'--array', '2',
			'--array', 'true',
			'--array', 'false'
		]);
		expected = {
			array: [
				'hello',
				'hello world',
				0,
				1,
				2,
				true,
				false
			]
		};
		actual = parseArgs(input);
		expect(actual).to.eql(expected);

		input = defaultArgs.concat(['--no', 'false']);
		expected = { no: false };
		actual = parseArgs(input);
		expect(actual).to.eql(expected);
	});

	it('should handle nested options', function() {
		var input, expected, actual;

		input = defaultArgs.concat([
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
			'--nested.array', 'false'
		]);
		expected = {
			nested: {
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
			}
		};
		actual = parseArgs(input);
		expect(actual).to.eql(expected);
	});

	it('should handle multiple options', function() {
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
			'--nested.array', 'false'
		]);
		expected = {
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
			],
			nested: {
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
			}
		};
		actual = parseArgs(input);
		expect(actual).to.eql(expected);
	});

	it('should handle alternate option styles', function() {
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
			'--nested.array=false'
		]);
		expected = {
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
			],
			nested: {
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
			}
		};
		actual = parseArgs(input);
		expect(actual).to.eql(expected);

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
			'-a', 'false'
		]);
		expected = {
			h: 'hello',
			m: 'hello world',
			z: 0,
			o: 1,
			t: 2,
			y: true,
			n: false,
			a: [
				'hello',
				'hello world',
				0,
				1,
				2,
				true,
				false
			]
		};
		actual = parseArgs(input);
		expect(actual).to.eql(expected);
	});

	it('should handle additional arguments with no options', function() {
		var input, expected, actual;

		input = defaultArgs.concat(['file1', 'file2', 'file3']);
		expected = {
			0: 'file1',
			1: 'file2',
			2: 'file3'
		};
		actual = parseArgs(input);
		expect(actual).to.eql(expected);
	});

	it('should handle additional arguments with options', function() {
		var input, expected, actual;

		input = defaultArgs.concat([
			'--hello', 'hello',
			'--message', 'hello world',
			'--zero', '0',
			'--one', '1',
			'--two', '2',
			'--yes', 'true',
			'--no', 'false',
			'--nested.hello', 'hello',
			'--nested.message', 'hello world',
			'--nested.zero', '0',
			'--nested.one', '1',
			'--nested.two', '2',
			'--nested.yes', 'true',
			'--nested.no', 'false',
			'file1',
			'file2',
			'file3'
		]);
		expected = {
			0: 'file1',
			1: 'file2',
			2: 'file3',
			hello: 'hello',
			message: 'hello world',
			zero: 0,
			one: 1,
			two: 2,
			yes: true,
			no: false,
			nested: {
				hello: 'hello',
				message: 'hello world',
				zero: 0,
				one: 1,
				two: 2,
				yes: true,
				no: false
			}
		};
		actual = parseArgs(input);
		expect(actual).to.eql(expected);
	});
});
