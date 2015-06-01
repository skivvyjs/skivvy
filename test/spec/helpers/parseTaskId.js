'use strict';

var chai = require('chai');
var expect = chai.expect;

describe('helpers.parseTaskId()', function() {
	var parseTaskId;
	before(function() {
		parseTaskId = require('../../../lib/helpers/parseTaskId');
	});

	it('should parse local task names', function() {
		var result = parseTaskId('task');
		expect(result).to.eql({
			package: null,
			task: 'task',
			target: 'default'
		});
	});

	it('should parse local task names with target', function() {
		var result = parseTaskId('task:target');
		expect(result).to.eql({
			package: null,
			task: 'task',
			target: 'target'
		});
	});

	it('should parse external task names', function() {
		var result = parseTaskId('package::task');
		expect(result).to.eql({
			package: 'package',
			task: 'task',
			target: 'default'
		});
	});

	it('should parse external task names with target', function() {
		var result = parseTaskId('package::task:target');
		expect(result).to.eql({
			package: 'package',
			task: 'task',
			target: 'target'
		});
	});

	it.only('should return null for empty task names', function() {
		var results = [
			parseTaskId(undefined),
			parseTaskId(null),
			parseTaskId('')
		];
		results.forEach(function(result) {
			expect(result).to.equal(null);
		});
	});
});
