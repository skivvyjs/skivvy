'use strict';

var chai = require('chai');
var expect = chai.expect;

var constants = require('../../lib/constants');

describe('constants', function() {
	it('should expose the correct constants', function() {
		var keys = [
			'CONFIG_FILENAME',
			'MODULE_PREFIX',
			'OFFICIAL_PACKAGE_SCOPE',
			'LOCAL_TASKS_PATH',
			'DEFAULT_ENVIRONMENT_NAME',
			'DEFAULT_TARGET_NAME',
			'TASK_NAME_PACKAGE_SEPARATOR',
			'TASK_NAME_TARGET_SEPARATOR'
		];

		keys.forEach(function(key) {
			var value = constants[key];
			expect(value).to.be.a('string');
			expect(value).not.to.be.empty;
		});
	});
});
