'use strict';

var chai = require('chai');
var expect = chai.expect;
var EventEmitter = require('events').EventEmitter;

var mockLogFactory = require('../../../fixtures/mockLogFactory');
var mockColorsFactory = require('../../../fixtures/mockColorsFactory');

var events = require('../../../../lib/events');

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
			expected: [
				{ type: 'info', message: 'Initializing project at <path>' + projectPath + '</path>' }
			]
		});

		testEventLog({
			event: events.INIT_PROJECT_FAILED,
			data: { path: projectPath, error: new Error() },
			expected: [
				{ type: 'error', message: 'Failed to initialize project at <path>' + projectPath + '</path>' }
			]
		});

		testEventLog({
			event: events.INIT_PROJECT_COMPLETED,
			data: { path: projectPath },
			expected: [
				{ type: 'success', message: 'Project initialized at <path>' + projectPath + '</path>' }
			]
		});

		testEventLog({
			event: events.INIT_PROJECT_NPM_INIT_NEEDED,
			data: { path: projectPath },
			expected: [
				{ type: 'warn', message: 'No package.json file found at <path>' + projectPath + '</path>' },
				{ type: 'info', message: 'Follow the prompts to initialize a new npm module:' }
			]
		});
	});

	it('should log package install events', function() {
		var packageName = '@my-packages/my-package';

		testEventLog({
			event: events.INSTALL_PACKAGE_STARTED,
			data: { package: packageName },
			expected: [
				{ type: 'info', message: 'Installing package <package>' + packageName + '</package>' }
			]
		});

		testEventLog({
			event: events.INSTALL_PACKAGE_FAILED,
			data: { package: packageName, error: new Error() },
			expected: [
				{ type: 'error', message: 'Failed to install package <package>' + packageName + '</package>' }
			]
		});

		testEventLog({
			event: events.INSTALL_PACKAGE_COMPLETED,
			data: { package: packageName, version: '1.2.3' },
			expected: [
				{ type: 'success', message: 'Installed package <package>' + packageName + '@1.2.3</package>' }
			]
		});
	});

	it('should log package uninstall events', function() {
		var packageName = '@my-packages/my-package';

		testEventLog({
			event: events.UNINSTALL_PACKAGE_STARTED,
			data: { package: packageName },
			expected: [
				{ type: 'info', message: 'Uninstalling package <package>' + packageName + '</package>' }
			]
		});

		testEventLog({
			event: events.UNINSTALL_PACKAGE_FAILED,
			data: { package: packageName, error: new Error() },
			expected: [
				{ type: 'error', message: 'Failed to uninstall package <package>' + packageName + '</package>' }
			]
		});

		testEventLog({
			event: events.UNINSTALL_PACKAGE_COMPLETED,
			data: { package: packageName },
			expected: [
				{ type: 'success', message: 'Uninstalled package <package>' + packageName + '</package>' }
			]
		});
	});

	it('should log package update events', function() {
		var packageName = '@my-packages/my-package';

		testEventLog({
			event: events.UPDATE_PACKAGE_STARTED,
			data: { package: packageName },
			expected: [
				{ type: 'info', message: 'Updating package <package>' + packageName + '</package>' }
			]
		});

		testEventLog({
			event: events.UPDATE_PACKAGE_FAILED,
			data: { package: packageName, error: new Error() },
			expected: [
				{ type: 'error', message: 'Failed to update package <package>' + packageName + '</package>' }
			]
		});

		testEventLog({
			event: events.UPDATE_PACKAGE_COMPLETED,
			data: { package: packageName, version: '1.2.3' },
			expected: [
				{ type: 'success', message: 'Updated package <package>' + packageName + '@1.2.3</package>' }
			]
		});
	});

	it('should log and time named task events', function() {
		var task = function() {};
		task.displayName = '@my-packages/my-package:hello';

		testEventLog({
			event: events.TASK_STARTED,
			data: { task: task },
			expected: [
				{ type: 'info', message: 'Task started: <task>' + task.displayName + '</task>' }
			]
		});

		testEventLog({
			event: events.TASK_FAILED,
			data: { task: task, error: new Error(), elapsed: 100 },
			expected: [
				{ type: 'error', message: 'Task failed: <task>' + task.displayName + '</task> (<time>100ms</time>)' }
			]
		});

		testEventLog({
			event: events.TASK_COMPLETED,
			data: { task: task, result: null, elapsed: 100 },
			expected: [
				{ type: 'success', message: 'Task completed: <task>' + task.displayName + '</task> (<time>100ms</time>)' }
			]
		});
	});

	it('should log and time named task group events', function() {
		var task = [];
		task.displayName = '@my-packages/my-package:hello';

		testEventLog({
			event: events.TASK_STARTED,
			data: { task: task },
			expected: [
				{ type: 'info', message: 'Task started: <task>' + task.displayName + '</task>' }
			]
		});

		testEventLog({
			event: events.TASK_FAILED,
			data: { task: task, error: new Error(), elapsed: 100 },
			expected: [
				{ type: 'error', message: 'Task failed: <task>' + task.displayName + '</task> (<time>100ms</time>)' }
			]
		});

		testEventLog({
			event: events.TASK_COMPLETED,
			data: { task: task, result: null, elapsed: 100 },
			expected: [
				{ type: 'success', message: 'Task completed: <task>' + task.displayName + '</task> (<time>100ms</time>)' }
			]
		});
	});

	it('should not log unnamed task events', function() {
		var task = function() { };

		testEventLog({
			event: events.TASK_STARTED,
			data: { task: task },
			expected: []
		});

		testEventLog({
			event: events.TASK_FAILED,
			data: { task: task, error: new Error() },
			expected: []
		});

		testEventLog({
			event: events.TASK_COMPLETED,
			data: { task: task },
			expected: []
		});
	});


	function testEventLog(test) {
		var event = test.event;
		var eventData = test.data;
		var expectedEvents = test.expected;

		var mockApi = createMockApi();
		var detachReporter = reporter(mockApi);

		mockApi.emit(event, eventData);

		var expected, actual;
		expected = expectedEvents;
		actual = mockApi.utils.log.messages;
		expect(actual).to.eql(expected);

		mockApi.utils.log.reset();

		detachReporter();
		mockApi.emit(event, eventData);

		expected = [];
		actual = mockApi.utils.log.messages;
		expect(actual).to.eql(expected);


		function createMockApi(mockLog, mockColors) {
			var api = new EventEmitter();
			api.utils = {
				log: mockLogFactory(),
				colors: mockColorsFactory()
			};
			return api;
		}
	}
});
