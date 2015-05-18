'use strict';

var chai = require('chai');
var expect = chai.expect;
var chalk = require('chalk');
var EventEmitter = require('events').EventEmitter;

var sharedTests = require('../../utils/sharedTests');

var events = require('../../../../lib/events');
var utils = require('../../../../lib/utils');

var reporter = require('../../../../lib/cli/utils/reporter');

describe('cli.utils.reporter()', function() {

	it('should attach and detach from the API', function() {
		var actual;

		actual = function() {
			var mockApi = new EventEmitter();

			var detach1 = reporter(mockApi);
			detach1();
			detach1();

			var detach2 = reporter(mockApi);
			detach2();
		};
		expect(actual).to.not.throw();
	});

	it('should log project init events', function() {
		var projectPath = process.cwd();

		testEventLog({
			event: events.INIT_PROJECT_STARTED,
			data: { path: projectPath },
			expected: chalk.black('Initializing project at ' + chalk.magenta(projectPath))
		});

		testEventLog({
			event: events.INIT_PROJECT_FAILED,
			data: { path: projectPath, error: new Error() },
			expected: chalk.red('Failed to initialize project at ' + chalk.magenta(projectPath))
		});

		testEventLog({
			event: events.INIT_PROJECT_COMPLETED,
			data: { path: projectPath },
			expected: chalk.bold('Initialized project at ' + chalk.magenta(projectPath))
		});

		testEventLog({
			event: events.INIT_PROJECT_NPM_INIT_NEEDED,
			data: { path: projectPath },
			expected: [
				chalk.yellow('No package.json file found at ' + chalk.magenta(projectPath)),
				chalk.black('Follow the prompts to initialize a new npm module:')
			]
		});

		testEventLog({
			event: events.INIT_PROJECT_API_INSTALL_NEEDED,
			data: { path: projectPath },
			expected: chalk.black('Installing API module for use in local tasks...')
		});
	});

	it('should log package install events', function() {
		var packageName = '@my-packages/my-package';

		testEventLog({
			event: events.INSTALL_PACKAGE_STARTED,
			data: { package: packageName },
			expected: chalk.black('Installing package ' + chalk.magenta(packageName))
		});

		testEventLog({
			event: events.INSTALL_PACKAGE_FAILED,
			data: { package: packageName, error: new Error() },
			expected: chalk.red('Failed to install package ' + chalk.magenta(packageName))
		});

		testEventLog({
			event: events.INSTALL_PACKAGE_COMPLETED,
			data: { package: packageName, version: '1.2.3' },
			expected: chalk.bold('Installed package ' + chalk.magenta(packageName + '@1.2.3'))
		});
	});

	it('should log package uninstall events', function() {
		var packageName = '@my-packages/my-package';

		testEventLog({
			event: events.UNINSTALL_PACKAGE_STARTED,
			data: { package: packageName },
			expected: chalk.black('Uninstalling package ' + chalk.magenta(packageName))
		});

		testEventLog({
			event: events.UNINSTALL_PACKAGE_FAILED,
			data: { package: packageName, error: new Error() },
			expected: chalk.red('Failed to uninstall package ' + chalk.magenta(packageName))
		});

		testEventLog({
			event: events.UNINSTALL_PACKAGE_COMPLETED,
			data: { package: packageName },
			expected: chalk.bold('Uninstalled package ' + chalk.magenta(packageName))
		});
	});

	it('should log package update events', function() {
		var packageName = '@my-packages/my-package';

		testEventLog({
			event: events.UPDATE_PACKAGE_STARTED,
			data: { package: packageName },
			expected: chalk.black('Updating package ' + chalk.magenta(packageName))
		});

		testEventLog({
			event: events.UPDATE_PACKAGE_FAILED,
			data: { package: packageName, error: new Error() },
			expected: chalk.red('Failed to update package ' + chalk.magenta(packageName))
		});

		testEventLog({
			event: events.UPDATE_PACKAGE_COMPLETED,
			data: { package: packageName, version: '1.2.3' },
			expected: chalk.bold('Updated package ' + chalk.magenta(packageName + '@1.2.3'))
		});
	});

	it('should log and time named task events', function() {
		var task = function() {};
		task.displayName = '@my-packages/my-package:hello';

		testEventLog({
			event: events.TASK_STARTED,
			data: { task: task },
			expected: chalk.black('Task started: ' + chalk.magenta(task.displayName))
		});

		testEventLog({
			event: events.TASK_FAILED,
			data: { task: task, error: new Error(), elapsed: 100 },
			expected: chalk.red('Task failed: ' + chalk.magenta(task.displayName) + ' (100ms)')
		});

		testEventLog({
			event: events.TASK_COMPLETED,
			data: { task: task, result: null, elapsed: 100 },
			expected: chalk.bold('Task completed: ' + chalk.magenta(task.displayName) + ' (100ms)')
		});
	});

	it('should log and time named task group events', function() {
		var task = [];
		task.displayName = '@my-packages/my-package:hello';

		testEventLog({
			event: events.TASK_STARTED,
			data: { task: task },
			expected: chalk.black('Task started: ' + chalk.magenta(task.displayName))
		});

		testEventLog({
			event: events.TASK_FAILED,
			data: { task: task, error: new Error(), elapsed: 100 },
			expected: chalk.red('Task failed: ' + chalk.magenta(task.displayName) + ' (100ms)')
		});

		testEventLog({
			event: events.TASK_COMPLETED,
			data: { task: task, result: null, elapsed: 100 },
			expected: chalk.bold('Task completed: ' + chalk.magenta(task.displayName) + ' (100ms)')
		});
	});

	it('should log and time unnamed task group events', function() {
		var task = [];

		testEventLog({
			event: events.TASK_STARTED,
			data: { task: task },
			expected: chalk.black('Task group started')
		});

		testEventLog({
			event: events.TASK_FAILED,
			data: { task: task, error: new Error(), elapsed: 100 },
			expected: chalk.red('Task group failed (100ms)')
		});

		testEventLog({
			event: events.TASK_COMPLETED,
			data: { task: task, result: null, elapsed: 100 },
			expected: chalk.bold('Task group completed (100ms)')
		});
	});

	it('should not log unnamed task events', function() {
		var task = function() { };

		testEventLog({
			event: events.TASK_STARTED,
			data: { task: task },
			expected: null
		});

		testEventLog({
			event: events.TASK_FAILED,
			data: { task: task, error: new Error() },
			expected: null
		});

		testEventLog({
			event: events.TASK_COMPLETED,
			data: { task: task },
			expected: null
		});
	});


	function testEventLog(test) {
		var event = test.event;
		var eventData = test.data;
		var expected = test.expected;

		var mockApi = createMockApi();
		var detachCliLogger = reporter(mockApi);

		try {
			sharedTests.testLogOutput({
				actual: function() { mockApi.emit(event, eventData); },
				expected: expected
			});
		} catch (error) {
			detachCliLogger();
			throw error;
		}

		detachCliLogger();

		sharedTests.testLogOutput({
			actual: function() { mockApi.emit(event, eventData); },
			expected: null
		});


		function createMockApi() {
			var api = new EventEmitter();
			api.utils = utils;
			return api;
		}
	}
});
