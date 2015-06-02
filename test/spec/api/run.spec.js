'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var Promise = require('promise');
var Stream = require('stream');

var mockFiles = require('../../utils/mock-files');
var mockApiFactory = require('../../fixtures/mockApiFactory');

var InvalidTaskError = require('../../../lib/errors').InvalidTaskError;

var events = require('../../../lib/events');


chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('api.run()', function() {
	var MockApi;
	var mockApi;
	var run;
	before(function() {
		MockApi = mockApiFactory();
		mockApi = new MockApi('/project', 'production');
		run = require('../../../lib/api/run');
		run = run.bind(mockApi);
		global.sinon = sinon;
	});

	var unmockFiles = null;
	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
		MockApi.reset();
		mockApi.reset();
	});

	after(function() {
		delete global.sinon;
	});

	describe('local tasks', function() {

		it('should run local tasks with default target', function() {
			var pkg = {};
			var config = {};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = sinon.spy(function(config) {});'
			};
			unmockFiles = mockFiles(files);

			mockApi.stubs.taskConfig = {
				message: 'Hello, world!',
				user: 'world'
			};

			return run({
				task: 'task'
			})
				.then(function() {
					var task = require('/project/skivvy_tasks/task');
					expect(task).to.have.been.calledOnce;
					expect(task).to.have.been.calledWith({
						message: 'Hello, world!',
						user: 'world'
					});

					expect(mockApi.getTaskConfig).to.have.been.calledOnce;
					expect(mockApi.getTaskConfig).to.have.been.calledWith({
						task: 'task',
						expand: true
					});
				});
		});

		it('should run local tasks with custom target', function() {
			var pkg = {};
			var config = {};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = sinon.spy(function(config) {});'
			};
			unmockFiles = mockFiles(files);

			mockApi.stubs.taskConfig = {
				message: 'Hello, world!',
				user: 'world'
			};

			return run({
				task: 'task:custom'
			})
				.then(function() {
					var task = require('/project/skivvy_tasks/task');
					expect(task).to.have.been.calledOnce;
					expect(task).to.have.been.calledWith({
						message: 'Hello, world!',
						user: 'world'
					});

					expect(mockApi.getTaskConfig).to.have.been.calledOnce;
					expect(mockApi.getTaskConfig).to.have.been.calledWith({
						task: 'task:custom',
						expand: true
					});
				});
		});

		it('should run local tasks with overridden config', function() {
			var pkg = {};
			var config = {};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = sinon.spy(function(config) {});'
			};
			unmockFiles = mockFiles(files);

			mockApi.stubs.taskConfig = {
				message: 'Hello, world!',
				user: 'world'
			};

			return run({
				task: 'task:custom',
				config: {
					message: 'Goodbye, world!'
				}
			})
				.then(function() {
					var task = require('/project/skivvy_tasks/task');
					expect(task).to.have.been.calledOnce;
					expect(task).to.have.been.calledWith({
						message: 'Goodbye, world!',
						user: 'world'
					});

					expect(mockApi.getTaskConfig).to.have.been.calledOnce;
					expect(mockApi.getTaskConfig).to.have.been.calledWith({
						task: 'task:custom',
						expand: true
					});
				});
		});

		it('should run local tasks with expanded placeholders in overridden config', function() {
			var pkg = {
				version: '1.0.1'
			};
			var config = {};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = sinon.spy(function(config) {});'
			};
			unmockFiles = mockFiles(files);

			mockApi.stubs.environmentConfig = {
				id: 'hello-world'
			};
			mockApi.stubs.taskConfig = {
				message: 'Hello, world!',
				user: 'world'
			};

			return run({
				task: 'task:custom',
				config: {
					message: 'Goodbye, world!',
					sender: '<%= environment.id %> v<%= project.version %>'
				}
			})
				.then(function() {
					var task = require('/project/skivvy_tasks/task');
					expect(task).to.have.been.calledOnce;
					expect(task).to.have.been.calledWith({
						message: 'Goodbye, world!',
						user: 'world',
						sender: 'hello-world v1.0.1'
					});

					expect(mockApi.getTaskConfig).to.have.been.calledOnce;
					expect(mockApi.getTaskConfig).to.have.been.calledWith({
						task: 'task:custom',
						expand: true
					});

					expect(mockApi.getEnvironmentConfig).to.have.been.calledOnce;
					expect(mockApi.getEnvironmentConfig).to.have.been.calledWith({
						expand: true
					});
				});
		});

		it('should run local tasks with multiple targets', function() {
			var pkg = {};
			var config = {};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = sinon.spy(function(config) {});'
			};
			unmockFiles = mockFiles(files);

			mockApi.stubs.taskConfig = [
				{
					message: 'Hello, world!',
					user: 'world'
				},
				{
					message: 'Goodbye, world!',
					user: 'world'
				}
			];

			return run({
				task: 'task'
			})
				.then(function() {
					var task = require('/project/skivvy_tasks/task');
					expect(task).to.have.been.calledTwice;
					expect(task).to.have.been.calledWith({
						message: 'Hello, world!',
						user: 'world'
					});
					expect(task).to.have.been.calledWith({
						message: 'Goodbye, world!',
						user: 'world'
					});
				});
		});
	});

	describe('external tasks', function() {

		it('should run external tasks with default target', function() {
			var pkg = {};
			var config = {};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/node_modules/@skivvy/skivvy-package-package/package.json': '{}',
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: sinon.spy(function(config) {}) }'
			};
			unmockFiles = mockFiles(files);

			mockApi.stubs.taskConfig = {
				message: 'Hello, world!',
				user: 'world'
			};

			return run({
				task: 'package::task'
			})
				.then(function() {
					var task = require('/project/node_modules/@skivvy/skivvy-package-package').tasks['task'];
					expect(task).to.have.been.calledOnce;
					expect(task).to.have.been.calledWith({
						message: 'Hello, world!',
						user: 'world'
					});

					expect(mockApi.getTaskConfig).to.have.been.calledOnce;
					expect(mockApi.getTaskConfig).to.have.been.calledWith({
						task: 'package::task',
						expand: true
					});
				});
		});

		it('should run external tasks with custom target', function() {
			var pkg = {};
			var config = {};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/node_modules/@skivvy/skivvy-package-package/package.json': '{}',
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: sinon.spy(function(config) {}) }'
			};
			unmockFiles = mockFiles(files);

			mockApi.stubs.taskConfig = {
				message: 'Hello, world!',
				user: 'world'
			};

			return run({
				task: 'package::task:custom'
			})
				.then(function() {
					var task = require('/project/node_modules/@skivvy/skivvy-package-package').tasks['task'];
					expect(task).to.have.been.calledOnce;
					expect(task).to.have.been.calledWith({
						message: 'Hello, world!',
						user: 'world'
					});

					expect(mockApi.getTaskConfig).to.have.been.calledOnce;
					expect(mockApi.getTaskConfig).to.have.been.calledWith({
						task: 'package::task:custom',
						expand: true
					});
				});
		});

		it('should run external tasks with overridden config', function() {
			var pkg = {};
			var config = {};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/node_modules/@skivvy/skivvy-package-package/package.json': '{}',
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: sinon.spy(function(config) {}) }'
			};
			unmockFiles = mockFiles(files);

			mockApi.stubs.taskConfig = {
				message: 'Hello, world!',
				user: 'world'
			};

			return run({
				task: 'package::task:custom',
				config: {
					message: 'Goodbye, world!'
				}
			})
				.then(function() {
					var task = require('/project/node_modules/@skivvy/skivvy-package-package').tasks['task'];
					expect(task).to.have.been.calledOnce;
					expect(task).to.have.been.calledWith({
						message: 'Goodbye, world!',
						user: 'world'
					});

					expect(mockApi.getTaskConfig).to.have.been.calledOnce;
					expect(mockApi.getTaskConfig).to.have.been.calledWith({
						task: 'package::task:custom',
						expand: true
					});
				});
		});

		it('should run external tasks with expanded placeholders in overridden config', function() {
			var pkg = {
				version: '1.0.1'
			};
			var config = {};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/node_modules/@skivvy/skivvy-package-package/package.json': '{}',
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: sinon.spy(function(config) {}) }'
			};
			unmockFiles = mockFiles(files);

			mockApi.stubs.environmentConfig = {
				id: 'hello-world'
			};
			mockApi.stubs.packageConfig = {
				id: 'my-package'
			};
			mockApi.stubs.taskConfig = {
				message: 'Hello, world!',
				user: 'world'
			};

			return run({
				task: 'package::task:custom',
				config: {
					message: 'Goodbye, world!',
					sender: '<%= environment.id %> <%= package.id %> v<%= project.version %>'
				}
			})
				.then(function() {
					var task = require('/project/node_modules/@skivvy/skivvy-package-package').tasks['task'];
					expect(task).to.have.been.calledOnce;
					expect(task).to.have.been.calledWith({
						message: 'Goodbye, world!',
						user: 'world',
						sender: 'hello-world my-package v1.0.1'
					});

					expect(mockApi.getTaskConfig).to.have.been.calledOnce;
					expect(mockApi.getTaskConfig).to.have.been.calledWith({
						task: 'package::task:custom',
						expand: true
					});

					expect(mockApi.getEnvironmentConfig).to.have.been.calledOnce;
					expect(mockApi.getEnvironmentConfig).to.have.been.calledWith({
						expand: true
					});
				});
		});

		it('should run external tasks with multiple targets', function() {
			var pkg = {};
			var config = {};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/node_modules/@skivvy/skivvy-package-package/package.json': '{}',
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: sinon.spy(function(config) {}) }'
			};
			unmockFiles = mockFiles(files);

			mockApi.stubs.taskConfig = [
				{
					message: 'Hello, world!',
					user: 'world'
				},
				{
					message: 'Goodbye, world!',
					user: 'world'
				}
			];

			return run({
				task: 'package::task'
			})
				.then(function() {
					var task = require('/project/node_modules/@skivvy/skivvy-package-package').tasks['task'];
					expect(task).to.have.been.calledTwice;
					expect(task).to.have.been.calledWith({
						message: 'Hello, world!',
						user: 'world'
					});
					expect(task).to.have.been.calledWith({
						message: 'Goodbye, world!',
						user: 'world'
					});
				});
		});
	});

	describe('anonymous tasks', function() {

		it('should run function tasks with the provided config', function() {
			var config = {
				message: 'Hello, world!',
				user: 'world'
			};
			var task = sinon.spy(function(config) {});

			var promise = run({
				task: task,
				config: config
			});
			return promise.then(function() {
				expect(task).to.have.been.calledWith({
					message: 'Hello, world!',
					user: 'world'
				});
			});
		});

		it('should run { function, config } tasks with their own config', function() {
			var task = sinon.spy(function(config) {});
			return run({
				task: {
					task: task,
					config: {
						message: 'Goodbye, world'
					}
				},
				config: {
					message: 'Hello, world!',
					user: 'world'
				}
			}).then(function() {
				expect(task).to.have.been.calledWith({
					message: 'Goodbye, world'
				});
			});
		});
	});

	describe('running tasks', function() {

		it('should pass the API as the \'this\' object', function() {
			var config = {};
			var task = function(config) {
				var api = this;
				return api;
			};

			var promise = run({
				task: task,
				config: config
			});
			return expect(promise).to.eventually.equal(mockApi);
		});

		it('should resolve with a value for synchronous tasks', function() {
			var task = function(config) {
				return 'Hello, world!';
			};

			var promise = run({
				task: task
			});
			return expect(promise).to.eventually.equal('Hello, world!');
		});

		it('should reject with an error for synchronous tasks', function() {
			var task = function(config) {
				throw new Error('Test error');
			};

			var promise = run({
				task: task
			});
			return expect(promise).to.be.rejectedWith('Test error');
		});

		it('should handle asynchronous tasks by returning a promise (success)', function() {
			var task = function(config) {
				return new Promise(function(resolve, reject) {
					setTimeout(function() {
						resolve('Hello, world!');
					});
				});
			};

			var promise = run({
				task: task
			});
			return expect(promise).to.eventually.equal('Hello, world!');
		});

		it('should handle asynchronous tasks by returning a promise (failure)', function() {
			var task = function(config) {
				return new Promise(function(resolve, reject) {
					setTimeout(function() {
						reject(new Error('Test error'));
					});
				});
			};

			var promise = run({
				task: task
			});
			return expect(promise).to.be.rejectedWith('Test error');
		});

		it('should handle asynchronous functions by returning a stream (success)', function() {
			var dataSpy = sinon.spy();
			var completedSpy = sinon.spy();
			var task = function(config) {
				var chunks = ['hello', 'world'];
				var stream = new Stream.Readable({ objectMode: true, highWaterMark: 0 });
				stream._read = function() {
					if (chunks.length === 0) {
						completedSpy();
						this.push(null);
					} else {
						dataSpy();
						this.push(chunks.shift());
					}
				};
				return stream;
			};

			var promise = run({
				task: task
			});
			return promise
				.then(function(returnValue) {
					expect(returnValue).to.equal(undefined);

					expect(dataSpy).to.have.callCount(['hello', 'world'].length);
					expect(completedSpy).to.have.been.calledOnce;
				});
		});

		it('should handle asynchronous functions by returning a stream (failure)', function() {
			var task = function(config) {
				var stream = new Stream.Readable({ objectMode: true, highWaterMark: 0 });
				stream._read = function() {
					this.emit('error', new Error('Test error'));
				};
				return stream;
			};

			var promise = run({
				task: task
			});
			return expect(promise).to.be.rejectedWith('Test error');
		});

		it('should handle asynchronous tasks by providing a callback (success)', function() {
			var task = function(config, callback) {
				setTimeout(function() {
					callback(null, 'Hello, world!');
				});
			};

			var promise = run({
				task: task
			});
			return expect(promise).to.eventually.equal('Hello, world!');
		});

		it('should handle asynchronous tasks by providing a callback (void)', function() {
			var task = function(config, callback) {
				setTimeout(function() {
					callback();
				});
			};

			var promise = run({
				task: task
			});
			return expect(promise).to.eventually.equal(undefined);
		});

		it('should handle asynchronous tasks by providing a callback (failure)', function() {
			var task = function(config, callback) {
				setTimeout(function() {
					callback(new Error('Test error'));
				});
			};

			var promise = run({
				task: task
			});
			return expect(promise).to.be.rejectedWith('Test error');
		});
	});

	describe('task arrays', function() {

		it('should run an array of function tasks in series', function() {
			var task1 = sinon.spy(function(config, callback) {
				setTimeout(function() {
					callback(null, 'task1');
				});
			});
			var task2 = sinon.spy(function(config, callback) {
				setTimeout(function() {
					callback(null, 'task2');
				});
			});
			var task3 = sinon.spy(function(config, callback) {
				setTimeout(function() {
					callback(null, 'task3');
				});
			});

			return run({
				task: [task1, task2, task3],
				config: {
					user: 'world'
				}
			})
				.then(function(returnValue) {
					expect(returnValue).to.eql(['task1', 'task2', 'task3']);

					expect(task1).to.have.been.calledOnce;
					expect(task2).to.have.been.calledOnce;
					expect(task3).to.have.been.calledOnce;
					expect(task1).to.have.been.calledWith({ user: 'world' });
					expect(task2).to.have.been.calledWith({ user: 'world' });
					expect(task3).to.have.been.calledWith({ user: 'world' });
				});
		});

		it('should run an array of named tasks in series', function() {
			var pkg = {};
			var config = {};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = sinon.spy(function(config) { return "local"; });',
				'/project/node_modules/@skivvy/skivvy-package-package/package.json': '{}',
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: sinon.spy(function(config) { return "external"; }) }',
				'/project/node_modules/@scoped/skivvy-package-package/package.json': '{}',
				'/project/node_modules/@scoped/skivvy-package-package/index.js': 'exports.tasks = { task: sinon.spy(function(config) { return "scoped"; }) }'
			};
			unmockFiles = mockFiles(files);

			mockApi.stubs.taskConfig = function(options) {
				return {
					id: options.task
				};
			};

			return run({
				task: [
					'task',
					'task:target',
					'package::task',
					'package::task:target',
					'@scoped/package::task',
					'@scoped/package::task:target'
				]
			})
				.then(function(returnValue) {
					expect(returnValue).to.eql(['local', 'local', 'external', 'external', 'scoped', 'scoped']);
					var localTask = require('/project/skivvy_tasks/task.js');
					var externalTask = require('/project/node_modules/@skivvy/skivvy-package-package').tasks.task;
					var scopedTask = require('/project/node_modules/@scoped/skivvy-package-package').tasks.task;
					expect(localTask).to.have.been.calledTwice;
					expect(localTask).to.have.been.calledWith({
						id: 'task'
					});
					expect(localTask).to.have.been.calledWith({
						id: 'task:target'
					});
					expect(externalTask).to.have.been.calledTwice;
					expect(externalTask).to.have.been.calledWith({
						id: 'package::task'
					});
					expect(externalTask).to.have.been.calledWith({
						id: 'package::task:target'
					});
					expect(scopedTask).to.have.been.calledTwice;
					expect(scopedTask).to.have.been.calledWith({
						id: '@scoped/package::task'
					});
					expect(scopedTask).to.have.been.calledWith({
						id: '@scoped/package::task:target'
					});
				});
		});

		it('should run named composite tasks and pass config correctly', function() {
			var pkg = {};
			var config = {};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/composite.js': 'module.exports = [sinon.spy(function(config) { return "anonymous"; }), { task: sinon.spy(function(config) { return "anonymous"; }), config: { foo: "bar" } }, "task", "task:custom", "package::task", "package::task:custom", { task: "task", config: { foo: "bar" } }, { task: "task:custom", config: { foo: "bar" } }, { task: "package::task", config: { foo: "bar" } }, { task: "package::task:custom", config: { foo: "bar" } }];',
				'/project/skivvy_tasks/task.js': 'module.exports = sinon.spy(function(config) { return "local"; });',
				'/project/node_modules/@skivvy/skivvy-package-package/package.json': '{}',
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: sinon.spy(function(config) { return "external"; }) }'
			};
			unmockFiles = mockFiles(files);

			mockApi.stubs.taskConfig = function(options) {
				return {
					id: options.task
				};
			};

			return run({
				task: 'composite',
				config: {
					override: true
				}
			})
				.then(function(returnValue) {
					expect(returnValue).to.eql(['anonymous', 'anonymous', 'local', 'local', 'external', 'external', 'local', 'local', 'external', 'external']);
					var anonymousTask = require('/project/skivvy_tasks/composite.js')[0];
					var anonymousConfiguredTask = require('/project/skivvy_tasks/composite.js')[1].task;
					var localTask = require('/project/skivvy_tasks/task.js');
					var externalTask = require('/project/node_modules/@skivvy/skivvy-package-package').tasks.task;
					expect(anonymousTask).to.have.been.calledOnce;
					expect(anonymousTask).to.have.been.calledWith({
						id: 'composite',
						override: true
					});
					expect(anonymousConfiguredTask).to.have.been.calledOnce;
					expect(anonymousConfiguredTask).to.have.been.calledWith({
						foo: 'bar'
					});
					expect(localTask.callCount).to.equal(4);
					expect(localTask).to.have.been.calledWith({
						id: 'task'
					});
					expect(localTask).to.have.been.calledWith({
						id: 'task:custom'
					});
					expect(localTask).to.have.been.calledWith({
						id: 'task',
						foo: 'bar'
					});
					expect(localTask).to.have.been.calledWith({
						id: 'task:custom',
						foo: 'bar'
					});
					expect(externalTask.callCount).to.equal(4);
					expect(externalTask).to.have.been.calledWith({
						id: 'package::task'
					});
					expect(externalTask).to.have.been.calledWith({
						id: 'package::task:custom'
					});
					expect(externalTask).to.have.been.calledWith({
						id: 'package::task',
						foo: 'bar'
					});
					expect(externalTask).to.have.been.calledWith({
						id: 'package::task:custom',
						foo: 'bar'
					});
				});
		});

		it('should pass expanded config overrides to named composite tasks', function() {
			var pkg = {
				version: '1.0.1'
			};
			var config = {};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/composite.js': 'module.exports = [sinon.spy(function(config) { return "anonymous"; }), { task: sinon.spy(function(config) { return "anonymous"; }), config: { foo: "bar" } }, "task", "task:custom", "package::task", "package::task:custom", { task: "task", config: { foo: "bar" } }, { task: "task:custom", config: { foo: "bar" } }, { task: "package::task", config: { foo: "bar" } }, { task: "package::task:custom", config: { foo: "bar" } }];',
				'/project/skivvy_tasks/task.js': 'module.exports = sinon.spy(function(config) { return "local"; });',
				'/project/node_modules/@skivvy/skivvy-package-package/package.json': '{}',
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: sinon.spy(function(config) { return "external"; }) }'
			};
			unmockFiles = mockFiles(files);

			mockApi.stubs.taskConfig = function(options) {
				return {
					id: options.task
				};
			};

			mockApi.stubs.environmentConfig = {
				id: 'hello-world'
			};

			return run({
				task: 'composite',
				config: {
					override: '<%= environment.id %> v<%= project.version %>'
				}
			})
				.then(function(returnValue) {
					expect(returnValue).to.eql(['anonymous', 'anonymous', 'local', 'local', 'external', 'external', 'local', 'local', 'external', 'external']);
					var anonymousTask = require('/project/skivvy_tasks/composite.js')[0];
					var anonymousConfiguredTask = require('/project/skivvy_tasks/composite.js')[1].task;
					var localTask = require('/project/skivvy_tasks/task.js');
					var externalTask = require('/project/node_modules/@skivvy/skivvy-package-package').tasks.task;
					expect(anonymousTask).to.have.been.calledOnce;
					expect(anonymousTask).to.have.been.calledWith({
						id: 'composite',
						override: 'hello-world v1.0.1'
					});
					expect(anonymousConfiguredTask).to.have.been.calledOnce;
					expect(anonymousConfiguredTask).to.have.been.calledWith({
						foo: 'bar'
					});
					expect(localTask.callCount).to.equal(4);
					expect(localTask).to.have.been.calledWith({
						id: 'task'
					});
					expect(localTask).to.have.been.calledWith({
						id: 'task:custom'
					});
					expect(localTask).to.have.been.calledWith({
						id: 'task',
						foo: 'bar'
					});
					expect(localTask).to.have.been.calledWith({
						id: 'task:custom',
						foo: 'bar'
					});
					expect(externalTask.callCount).to.equal(4);
					expect(externalTask).to.have.been.calledWith({
						id: 'package::task'
					});
					expect(externalTask).to.have.been.calledWith({
						id: 'package::task:custom'
					});
					expect(externalTask).to.have.been.calledWith({
						id: 'package::task',
						foo: 'bar'
					});
					expect(externalTask).to.have.been.calledWith({
						id: 'package::task:custom',
						foo: 'bar'
					});
				});
		});
	});

	describe('error handling', function() {

		it('should throw an error if no task was specified', function() {
			var pkg = {};
			var config = {};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config)
			};
			unmockFiles = mockFiles(files);

			var promises = [
				run(),
				run({ task: undefined }),
				run({ task: null }),
				run({ task: false }),
				run({ task: '' })
			];
			return Promise.all(promises.map(function(promise) {
				return expect(promise).to.be.rejectedWith(InvalidTaskError);
			}));
		});

		it('should throw an error if an invalid task name was specified', function() {
			var pkg = {};
			var config = {};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config)
			};
			unmockFiles = mockFiles(files);

			var promise = run({
				task: 'nonexistent'
			});
			return expect(promise).to.be.rejectedWith(InvalidTaskError);
		});
	});

	describe('events', function() {

		it('should dispatch task start and end events', function() {
			var task1 = function(config, callback) {
				setTimeout(function() {
					callback(null, 'task1');
				});
			};
			var task2 = function(config, callback) {
				setTimeout(function() {
					callback(null, 'task2');
				});
			};
			var task3 = function(config, callback) {
				setTimeout(function() {
					callback(null, 'task3');
				});
			};
			var compositeTask = [task1, task2, task3];

			var eventLog = [];

			mockApi.on(events.TASK_STARTED, onStarted);
			mockApi.on(events.TASK_COMPLETED, onCompleted);
			mockApi.on(events.TASK_FAILED, onFailed);


			function onStarted(data) {
				eventLog.push({
					event: events.TASK_STARTED,
					task: data.task,
					config: data.config
				});
			}

			function onCompleted(data) {
				eventLog.push({
					event: events.TASK_COMPLETED,
					result: data.result,
					task: data.task,
					config: data.config
				});
			}

			function onFailed(data) {
				eventLog.push({
					event: events.TASK_FAILED,
					error: data.error,
					task: data.task,
					config: data.config
				});
			}

			return run({
				task: compositeTask,
				config: {
					user: 'world'
				}
			})
				.then(function() {
					return expect(eventLog).to.eql([
						{
							event: events.TASK_STARTED,
							task: compositeTask,
							config: {
								user: 'world'
							}
						},
						{
							event: events.TASK_STARTED,
							task: task1,
							config: {
								user: 'world'
							}
						},
						{
							event: events.TASK_COMPLETED,
							result: 'task1',
							task: task1,
							config: {
								user: 'world'
							}
						},
						{
							event: events.TASK_STARTED,
							task: task2,
							config: {
								user: 'world'
							}
						},
						{
							event: events.TASK_COMPLETED,
							result: 'task2',
							task: task2,
							config: {
								user: 'world'
							}
						},
						{
							event: events.TASK_STARTED,
							task: task3,
							config: {
								user: 'world'
							}
						},
						{
							event: events.TASK_COMPLETED,
							result: 'task3',
							task: task3,
							config: {
								user: 'world'
							}
						},
						{
							event: events.TASK_COMPLETED,
							result: ['task1', 'task2', 'task3'],
							task: compositeTask,
							config: {
								user: 'world'
							}
						}
					]);
				});
		});
	});
});
