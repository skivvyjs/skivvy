'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinonChai = require('sinon-chai');

var mockFiles = require('../../utils/mock-files');

var mockApiFactory = require('../../fixtures/mockApiFactory');

var InvalidTaskError = require('../../../lib/errors').InvalidTaskError;

chai.use(sinonChai);

describe('api.getTaskConfig()', function() {
	var getTaskConfig;
	var MockApi;
	var mockApi;
	before(function() {
		MockApi = mockApiFactory();
		mockApi = new MockApi('/project');
		getTaskConfig = require('../../../lib/api/getTaskConfig');
		getTaskConfig = getTaskConfig.bind(mockApi);
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

	describe('error handling', function() {

		it('should throw an error if no task was specified', function() {
			var pkg = {};
			var config = {};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config)
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = InvalidTaskError;
			actual = [
				function() { getTaskConfig({ }); },
				function() { getTaskConfig({ task: undefined }); },
				function() { getTaskConfig({ task: null }); },
				function() { getTaskConfig({ task: false }); },
				function() { getTaskConfig({ task: '' }); }
			];
			actual.forEach(function(actual) {
				expect(actual).to.throw(expected);
			});
		});

		it('should throw an error if the specified task does not exist', function() {
			var pkg = {};
			var config = {};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config)
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = InvalidTaskError;
			actual = function() {
				return getTaskConfig({
					task: 'nonexistent'
				});
			};
			expect(actual).to.throw(expected);
		});
	});

	describe('local tasks', function() {

		it('should get local task config for default target', function() {var pkg = {};
			var config = {
				tasks: {
					'task': {
						targets: {
							default: {
								greeting: 'hello'
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = function(config) { };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = {
				greeting: 'hello'
			};
			actual = getTaskConfig({
				task: 'task'
			});
			expect(actual).to.eql(expected);
		});

		it('should get local task config for custom target', function() {
			var pkg = {};
			var config = {
				tasks: {
					'task': {
						targets: {
							default: {
								greeting: 'hello'
							},
							'goodbye': {
								greeting: 'goodbye'
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = function(config) { };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = {
				greeting: 'goodbye'
			};
			actual = getTaskConfig({
				task: 'task:goodbye'
			});
			expect(actual).to.eql(expected);
		});

		it('should get local task config for named default target', function() {
			var pkg = {};
			var config = {
				tasks: {
					'task': {
						targets: {
							default: 'goodbye',
							'goodbye': {
								greeting: 'goodbye'
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = function(config) { };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = {
				greeting: 'goodbye'
			};
			actual = getTaskConfig({
				task: 'task'
			});
			expect(actual).to.eql(expected);
		});

		it('should get local task config for named custom target', function() {
			var pkg = {};
			var config = {
				tasks: {
					'task': {
						targets: {
							default: {
								greeting: 'hello'
							},
							'goodbye': 'bye',
							'bye': {
								greeting: 'bye'
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = function(config) { };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = {
				greeting: 'bye'
			};
			actual = getTaskConfig({
				task: 'task:goodbye'
			});
			expect(actual).to.eql(expected);
		});

		it('should get local task config for default target objects array', function() {
			var pkg = {};
			var config = {
				tasks: {
					'task': {
						targets: {
							default: [
								{
									greeting: 'hello'
								},
								{
									greeting: 'goodbye'
								},
								{
									greeting: 'bye'
								}
							]
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = function(config) { };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = [
				{
					greeting: 'hello'
				},
				{
					greeting: 'goodbye'
				},
				{
					greeting: 'bye'
				}
			];
			actual = getTaskConfig({
				task: 'task'
			});
			expect(actual).to.eql(expected);
		});

		it('should get local task config for custom target objects array', function() {
			var pkg = {};
			var config = {
				tasks: {
					'task': {
						targets: {
							default: {},
							custom: [
								{
									greeting: 'hello'
								},
								{
									greeting: 'goodbye'
								}
							]
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = function(config) { };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = [
				{
					greeting: 'hello'
				},
				{
					greeting: 'goodbye'
				}
			];
			actual = getTaskConfig({
				task: 'task:custom'
			});
			expect(actual).to.eql(expected);
		});

		it('should get local task config for default target names array', function() {
			var pkg = {};
			var config = {
				tasks: {
					'task': {
						targets: {
							default: ['hello', 'goodbye', 'bye'],
							hello: {
								greeting: 'hello'
							},
							goodbye: {
								greeting: 'goodbye'
							},
							bye: {
								greeting: 'bye'
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = function(config) { };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = [
				{
					greeting: 'hello'
				},
				{
					greeting: 'goodbye'
				},
				{
					greeting: 'bye'
				}
			];
			actual = getTaskConfig({
				task: 'task'
			});
			expect(actual).to.eql(expected);
		});

		it('should get local task config for custom target names array', function() {
			var pkg = {};
			var config = {
				tasks: {
					'task': {
						targets: {
							default: {},
							custom: ['hello', 'goodbye', 'bye'],
							hello: {
								greeting: 'hello'
							},
							goodbye: {
								greeting: 'goodbye'
							},
							bye: {
								greeting: 'bye'
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = function(config) { };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = [
				{
					greeting: 'hello'
				},
				{
					greeting: 'goodbye'
				},
				{
					greeting: 'bye'
				}
			];
			actual = getTaskConfig({
				task: 'task:custom'
			});
			expect(actual).to.eql(expected);
		});
	});

	describe('external tasks', function() {

		it('should get external task config for default target', function() {var pkg = {};
			var config = {
				packages: {
					'package': {
						tasks: {
							'task': {
								targets: {
									default: {
										greeting: 'hello'
									}
								}
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/node_modules/@skivvy/skivvy-package-package/package.json': '{}',
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: function(config) { } };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = {
				greeting: 'hello'
			};
			actual = getTaskConfig({
				task: 'package::task'
			});
			expect(actual).to.eql(expected);
		});

		it('should get external task config for custom target', function() {
			var pkg = {};
			var config = {
				packages: {
					'package': {
						tasks: {
							'task': {
								targets: {
									default: {
										greeting: 'hello'
									},
									'goodbye': {
										greeting: 'goodbye'
									}
								}
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/node_modules/@skivvy/skivvy-package-package/package.json': '{}',
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: function(config) { } };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = {
				greeting: 'goodbye'
			};
			actual = getTaskConfig({
				task: 'package::task:goodbye'
			});
			expect(actual).to.eql(expected);
		});

		it('should get external task config for named default target', function() {
			var pkg = {};
			var config = {
				packages: {
					'package': {
						tasks: {
							'task': {
								targets: {
									default: 'goodbye',
									'goodbye': {
										greeting: 'goodbye'
									}
								}
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/node_modules/@skivvy/skivvy-package-package/package.json': '{}',
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: function(config) { } };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = {
				greeting: 'goodbye'
			};
			actual = getTaskConfig({
				task: 'package::task'
			});
			expect(actual).to.eql(expected);
		});

		it('should get external task config for named custom target', function() {
			var pkg = {};
			var config = {
				packages: {
					'package': {
						tasks: {
							'task': {
								targets: {
									default: {
										greeting: 'hello'
									},
									'goodbye': 'bye',
									'bye': {
										greeting: 'bye'
									}
								}
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/node_modules/@skivvy/skivvy-package-package/package.json': '{}',
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: function(config) { } };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = {
				greeting: 'bye'
			};
			actual = getTaskConfig({
				task: 'package::task:goodbye'
			});
			expect(actual).to.eql(expected);
		});

		it('should get external task config for default target objects array', function() {
			var pkg = {};
			var config = {
				packages: {
					'package': {
						tasks: {
							'task': {
								targets: {
									default: [
										{
											greeting: 'hello'
										},
										{
											greeting: 'goodbye'
										},
										{
											greeting: 'bye'
										}
									]
								}
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/node_modules/@skivvy/skivvy-package-package/package.json': '{}',
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: function(config) { } };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = [
				{
					greeting: 'hello'
				},
				{
					greeting: 'goodbye'
				},
				{
					greeting: 'bye'
				}
			];
			actual = getTaskConfig({
				task: 'package::task'
			});
			expect(actual).to.eql(expected);
		});

		it('should get external task config for custom target objects array', function() {
			var pkg = {};
			var config = {
				packages: {
					'package': {
						tasks: {
							'task': {
								targets: {
									default: {},
									custom: [
										{
											greeting: 'hello'
										},
										{
											greeting: 'goodbye'
										}
									]
								}
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/node_modules/@skivvy/skivvy-package-package/package.json': '{}',
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: function(config) { } };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = [
				{
					greeting: 'hello'
				},
				{
					greeting: 'goodbye'
				}
			];
			actual = getTaskConfig({
				task: 'package::task:custom'
			});
			expect(actual).to.eql(expected);
		});

		it('should get external task config for default target names array', function() {
			var pkg = {};
			var config = {
				packages: {
					'package': {
						tasks: {
							'task': {
								targets: {
									default: ['hello', 'goodbye', 'bye'],
									hello: {
										greeting: 'hello'
											},
									goodbye: {
										greeting: 'goodbye'
									},
									bye: {
										greeting: 'bye'
									}
								}
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/node_modules/@skivvy/skivvy-package-package/package.json': '{}',
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: function(config) { } };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = [
				{
					greeting: 'hello'
				},
				{
					greeting: 'goodbye'
				},
				{
					greeting: 'bye'
				}
			];
			actual = getTaskConfig({
				task: 'package::task'
			});
			expect(actual).to.eql(expected);
		});

		it('should get external task config for custom target names array', function() {
			var pkg = {};
			var config = {
				packages: {
					'package': {
						tasks: {
							'task': {
								targets: {
									default: {},
									custom: ['hello', 'goodbye', 'bye'],
									hello: {
										greeting: 'hello'
									},
									goodbye: {
										greeting: 'goodbye'
									},
									bye: {
										greeting: 'bye'
									}
								}
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/node_modules/@skivvy/skivvy-package-package/package.json': '{}',
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: function(config) { } };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = [
				{
					greeting: 'hello'
				},
				{
					greeting: 'goodbye'
				},
				{
					greeting: 'bye'
				}
			];
			actual = getTaskConfig({
				task: 'package::task:custom'
			});
			expect(actual).to.eql(expected);
		});
	});

	describe('default task config', function() {

		it('should return a copy of default task config if the specified task config does not exist', function() {
			var pkg = {};
			var config = {};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = function(config) { }; module.exports.defaults = { \'user\': \'world\' }'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = {
				user: 'world'
			};
			actual = getTaskConfig({
				task: 'task'
			});
			expect(actual).to.eql(expected);
		});

		it('should return a copy of the default task config if the specified target does not exist', function() {
			var pkg = {};
			var config = {
				tasks: {
					'task': {
						targets: {
							default: {
								greeting: 'hello'
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = function(config) { }; module.exports.defaults = { \'user\': \'world\' };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = {
				user: 'world'
			};
			actual = getTaskConfig({
				task: 'task:nonexistent'
			});
			expect(actual).to.eql(expected);
		});

		it('should extend the default task config if the default target exists', function() {
			var pkg = {};
			var config = {
				tasks: {
					'task': {
						targets: {
							default: {
								greeting: 'hello'
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = function(config) { }; module.exports.defaults = { \'user\': \'world\' };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = {
				greeting: 'hello',
				user: 'world'
			};
			actual = getTaskConfig({
				task: 'task'
			});
			expect(actual).to.eql(expected);
		});

		it('should extend the default task config if the specified custom target exists', function() {
			var pkg = {};
			var config = {
				tasks: {
					'task': {
						targets: {
							default: {
								greeting: 'hello'
							},
							custom: {
								greeting: 'goodbye'
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = function(config) { }; module.exports.defaults = { \'user\': \'world\' };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = {
				greeting: 'goodbye',
				user: 'world'
			};
			actual = getTaskConfig({
				task: 'task:custom'
			});
			expect(actual).to.eql(expected);
		});

		it('should return an empty object if the specified target does not exist and no default task config exists', function() {
			var pkg = {};
			var config = {
				tasks: {
					'task': {
						default: {
							greeting: 'hello'
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = function(config) { };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = {};
			actual = getTaskConfig({
				task: 'task:nonexistent'
			});
			expect(actual).to.eql(expected);
		});
	});

	describe('placeholders', function() {

		it('should skip expanding local task config placeholders', function() {
			var pkg = {
				version: '1.0.1'
			};
			var config = {
				tasks: {
					'task': {
						targets: {
							default: {
								message: 'Hello, <%= environment.user %>!',
								version: 'v<%= project.version %>'
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = function(config) { };'
			};
			unmockFiles = mockFiles(files);

			mockApi.stubs.environmentConfig = {
				user: 'world'
			};

			var expected, actual;
			expected = {
				'message': 'Hello, <%= environment.user %>!',
				'version': 'v<%= project.version %>'
			};
			actual = getTaskConfig({
				task: 'task'
			});
			expect(actual).to.eql(expected);
		});

		it('should expand local task config placeholders', function() {
			var pkg = {
				version: '1.0.1'
			};
			var config = {
				tasks: {
					'task': {
						targets: {
							default: {
								message: 'Hello, <%= environment.user %>!',
								version: 'v<%= project.version %>'
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = function(config) { };'
			};
			unmockFiles = mockFiles(files);

			mockApi.stubs.environmentConfig = {
				user: 'world'
			};

			var expected, actual;
			expected = {
				'message': 'Hello, world!',
				'version': 'v1.0.1'
			};
			actual = getTaskConfig({
				task: 'task',
				expand: true
			});
			expect(actual).to.eql(expected);

			expect(mockApi.getEnvironmentConfig).to.have.been.calledWith({
				expand: true
			});
		});

		it('should skip expanding external task config placeholders', function() {
			var pkg = {
				version: '1.0.1'
			};
			var config = {
				packages: {
					'package': {
						tasks: {
							'task': {
								targets: {
									default: {
										message: 'Hello, <%= environment.user %>!',
										version: '<%= package.id %> v<%= project.version %>'
									}
								}
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/node_modules/@skivvy/skivvy-package-package/package.json': '{}',
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: function(config) { } };'
			};
			unmockFiles = mockFiles(files);

			mockApi.stubs.environmentConfig = {
				user: 'world'
			};
			mockApi.stubs.packageConfig = {
				id: 'hello-world'
			};

			var expected, actual;
			expected = {
				'message': 'Hello, <%= environment.user %>!',
				'version': '<%= package.id %> v<%= project.version %>'
			};
			actual = getTaskConfig({
				task: 'package::task'
			});
			expect(actual).to.eql(expected);
		});

		it('should expand external task config placeholders', function() {
			var pkg = {
				version: '1.0.1'
			};
			var config = {
				packages: {
					'package': {
						tasks: {
							'task': {
								targets: {
									default: {
										message: 'Hello, <%= environment.user %>!',
										version: '<%= package.id %> v<%= project.version %>'
									}
								}
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/node_modules/@skivvy/skivvy-package-package/package.json': '{}',
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: function(config) { } };'
			};
			unmockFiles = mockFiles(files);

			mockApi.stubs.environmentConfig = {
				user: 'world'
			};
			mockApi.stubs.packageConfig = {
				id: 'hello-world'
			};

			var expected, actual;
			expected = {
				'message': 'Hello, world!',
				'version': 'hello-world v1.0.1'
			};
			actual = getTaskConfig({
				task: 'package::task',
				expand: true
			});
			expect(actual).to.eql(expected);

			expect(mockApi.getEnvironmentConfig).to.have.been.calledWith({
				expand: true
			});
			expect(mockApi.getPackageConfig).to.have.been.calledWith({
				package: 'package',
				expand: true
			});
		});
	});
});
