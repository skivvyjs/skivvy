'use strict';

var chai = require('chai');
var expect = chai.expect;

describe('helpers.formatTaskId()', function() {
	var formatTaskId;
	before(function() {
		formatTaskId = require('../../../lib/helpers/formatTaskId');
	});

	it('should format local task names', function() {
		var result = formatTaskId({
			task: 'task'
		});
		expect(result).to.eql('task:default');
	});

	it('should format local task names with target', function() {
		var result = formatTaskId({
			task: 'task',
			target: 'target'
		});
		expect(result).to.eql('task:target');
	});

	it('should format external task names', function() {
		var result = formatTaskId({
			package: 'package',
			task: 'task'
		});
		expect(result).to.eql('package::task:default');
	});

	it('should format external task names with target', function() {
		var result = formatTaskId({
			package: 'package',
			task: 'task',
			target: 'target'
		});
		expect(result).to.eql('package::task:target');
	});

	it.only('should return null for empty task names', function() {
		var results = [
			formatTaskId({ task: undefined }),
			formatTaskId({ task: null }),
			formatTaskId({ task: '' })
		];
		results.forEach(function(result) {
			expect(result).to.equal(null);
		});
	});
});
