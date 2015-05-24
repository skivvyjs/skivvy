'use strict';

var chai = require('chai');
var expect = chai.expect;

var errors = require('../../lib/errors');

describe('errors', function() {
	it('should expose the correct errors', function() {
		var keys = [
			'InvalidCwdError',
			'InvalidArgumentsError',
			'InvalidProjectError',
			'InvalidConfigError',
			'InvalidPackageError',
			'InvalidNpmModuleError',
			'InvalidTaskError',
			'InvalidTargetError',
			'MultipleMatchingTasksError'
		];

		keys.forEach(function(key) {
			var ErrorClass = errors[key];
			expect(ErrorClass).to.be.a('function');
			expect(new ErrorClass()).to.be.an.instanceof(Error);
		});
	});
});
