'use strict';

var chai = require('chai');
var expect = chai.expect;

var events = require('../../lib/events');

describe('events', function() {
	it('should expose the correct events', function() {

		var keys = [
			'INIT_PROJECT_STARTED',
			'INIT_PROJECT_FAILED',
			'INIT_PROJECT_COMPLETED',
			'INIT_PROJECT_NPM_INIT_NEEDED',

			'INSTALL_PACKAGE_STARTED',
			'INSTALL_PACKAGE_FAILED',
			'INSTALL_PACKAGE_COMPLETED',

			'UNINSTALL_PACKAGE_STARTED',
			'UNINSTALL_PACKAGE_FAILED',
			'UNINSTALL_PACKAGE_COMPLETED',

			'UPDATE_PACKAGE_STARTED',
			'UPDATE_PACKAGE_FAILED',
			'UPDATE_PACKAGE_COMPLETED',

			'UPDATE_ENVIRONMENT_CONFIG_STARTED',
			'UPDATE_ENVIRONMENT_CONFIG_FAILED',
			'UPDATE_ENVIRONMENT_CONFIG_COMPLETED',

			'UPDATE_PACKAGE_CONFIG_STARTED',
			'UPDATE_PACKAGE_CONFIG_FAILED',
			'UPDATE_PACKAGE_CONFIG_COMPLETED',

			'UPDATE_TASK_CONFIG_STARTED',
			'UPDATE_TASK_CONFIG_FAILED',
			'UPDATE_TASK_CONFIG_COMPLETED',

			'TASK_STARTED',
			'TASK_FAILED',
			'TASK_COMPLETED'
		];

		var values = [];
		keys.forEach(function(key) {
			var value = events[key];
			expect(value).to.be.a('string');
			expect(value).not.to.be.empty;
			expect(values.indexOf(value)).to.equal(-1);
			values.push(value);
		});
	});
});
