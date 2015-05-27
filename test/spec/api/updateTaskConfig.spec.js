'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var fs = require('fs');
var Promise = require('promise');

var mockFiles = require('../../utils/mock-files');

var mockApiFactory = require('../../fixtures/mockApiFactory');

var events = require('../../../lib/events');

var InvalidTaskError = require('../../../lib/errors').InvalidTaskError;
var InvalidConfigError = require('../../../lib/errors').InvalidConfigError;


chai.use(chaiAsPromised);

describe('api.updateTaskConfig()', function() {
	var MockApi;
	var mockApi;
	var updateTaskConfig;
	before(function() {
		MockApi = mockApiFactory();
		mockApi = new MockApi('/project');
		updateTaskConfig = require('../../../lib/api/updateTaskConfig');
		updateTaskConfig = updateTaskConfig.bind(mockApi);
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

	describe('basic operation', function() {

		it('should throw an error if no task name was specified', function() {
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
				updateTaskConfig({}),
				updateTaskConfig({ task: undefined }),
				updateTaskConfig({ task: null }),
				updateTaskConfig({ task: false }),
				updateTaskConfig({ task: '' })
			];
			return Promise.all(actual.map(function(actual) {
				return expect(actual).to.be.rejectedWith(expected);
			}));
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
			actual = updateTaskConfig({
				task: 'nonexistent'
			});
			return expect(actual).to.be.rejectedWith(expected);
		});

		it('should throw an error if no config object was specified', function() {
			var pkg = {};
			var config = {};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/task.js': 'module.exports = function(config) { };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = InvalidConfigError;
			actual = [
				updateTaskConfig({ task: 'task' }),
				updateTaskConfig({ updates: undefined, task: 'task' }),
				updateTaskConfig({ updates: null, task: 'task' }),
				updateTaskConfig({ updates: false, task: 'task' }),
				updateTaskConfig({ updates: '', task: 'task' })
			];
			return Promise.all(actual.map(function(actual) {
				return expect(actual).to.be.rejectedWith(expected);
			}));
		});
	});

	describe('local tasks', function() {

		it('should create the local task config for the default target', function() {
			var pkg = {};
			var config = {
				tasks: {
					'existing': {
						targets: {
							default: {
								message: 'Hello, world!'
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/existing.js': 'module.exports = function(config) { };',
				'/project/skivvy_tasks/task.js': 'module.exports = function(config) { };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			return updateTaskConfig({
				task: 'task',
				updates: {
					user: 'world'
				}
			})
				.then(function(returnValue) {
					actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
					expected = {
						tasks: {
							'existing': {
								targets: {
									default: {
										message: 'Hello, world!'
									}
								}
							},
							'task': {
								targets: {
									default: {
										user: 'world'
									}
								}
							}
						}
					};
					expect(actual).to.eql(expected);
				});
		});

		it('should create the local task config for custom targets', function() {var expected, actual;
			var pkg = {};
			var config = {
				tasks: {
					'existing': {
						targets: {
							default: {
								message: 'Hello, world!'
							}
						}
					}
				}
			};
			var files = {
				'/project/package.json': JSON.stringify(pkg),
				'/project/.skivvyrc': JSON.stringify(config),
				'/project/skivvy_tasks/existing.js': 'module.exports = function(config) { };',
				'/project/skivvy_tasks/task.js': 'module.exports = function(config) { };'
			};
			unmockFiles = mockFiles(files);

			return updateTaskConfig({
				task: 'task',
				target: 'custom',
				updates: {
					user: 'world'
				}
			})
				.then(function(returnValue) {
					actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
					expected = {
						tasks: {
							'existing': {
								targets: {
									default: {
										message: 'Hello, world!'
									}
								}
							},
							'task': {
								targets: {
									'custom': {
										user: 'world'
									}
								}
							}
						}
					};
					expect(actual).to.eql(expected);
				});
		});

		it('should update the local task config for the default target', function() {
			var pkg = {};
			var config = {
				tasks: {
					'task': {
						targets: {
							default: {
								message: 'Hello, world!'
							},
							'goodbye': {
								message: 'Goodbye, world!'
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
			return updateTaskConfig({
				task: 'task',
				updates: {
					user: 'world'
				}
			})
				.then(function(returnValue) {
					actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
					expected = {
						tasks: {
							'task': {
								targets: {
									default: {
										message: 'Hello, world!',
										user: 'world'
									},
									'goodbye': {
										message: 'Goodbye, world!'
									}
								}
							}
						}
					};
					expect(actual).to.eql(expected);
				});
		});

		it('should update the local task config for custom targets', function() {
			var pkg = {};
			var config = {
				tasks: {
					'task': {
						targets: {
							default: {
								message: 'Hello, world!'
							},
							'goodbye': {
								message: 'Goodbye, world!'
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
			return updateTaskConfig({
				task: 'task',
				target: 'goodbye',
				updates: {
					user: 'world'
				}
			})
				.then(function(returnValue) {
					actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
					expected = {
						tasks: {
							'task': {
								targets: {
									default: {
										message: 'Hello, world!'
									},
									'goodbye': {
										message: 'Goodbye, world!',
										user: 'world'
									}
								}
							}
						}
					};
					expect(actual).to.eql(expected);
				});
		});

		it('should update the local task config for new targets', function() {
			var pkg = {};
			var config = {
				tasks: {
					'task': {
						targets: {
							default: {
								message: 'Hello, world!'
							},
							'goodbye': {
								message: 'Goodbye, world!'
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
			return updateTaskConfig({
				task: 'task',
				target: 'bye',
				updates: {
					message: 'Bye, world!'
				}
			})
				.then(function(returnValue) {
					actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
					expected = {
						tasks: {
							'task': {
								targets: {
									default: {
										message: 'Hello, world!'
									},
									'goodbye': {
										message: 'Goodbye, world!'
									},
									'bye': {
										message: 'Bye, world!'
									}
								}
							}
						}
					};
					expect(actual).to.eql(expected);
				});
		});

		it('should return the updated local task config', function() {
			var pkg = {};
			var config = {
				tasks: {
					'task': {
						targets: {
							default: {
								message: 'Hello, world!'
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
				message: 'Hello, world!',
				user: 'world'
			};
			actual = updateTaskConfig({
				task: 'task',
				updates: {
					user: 'world'
				}
			});
			return expect(actual).to.eventually.eql(expected);
		});
	});

	describe('external tasks', function() {

		it('should create the external task config for the default target', function() {
			var pkg = {};
			var config = {
				packages: {
					'package': {
						tasks: {
							'existing': {
								targets: {
									default: {
										message: 'Hello, world!'
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
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { existing: function(config) {}, task: function(config) {} };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			return updateTaskConfig({
				package: 'package',
				task: 'task',
				updates: {
					user: 'world'
				}
			})
				.then(function(returnValue) {
					actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
					expected = {
						packages: {
							'package': {
								tasks: {
									'existing': {
										targets: {
											default: {
												message: 'Hello, world!'
											}
										}
									},
									'task': {
										targets: {
											default: {
												user: 'world'
											}
										}
									}
								}
							}
						}
					};
					expect(actual).to.eql(expected);
				});
		});

		it('should create the external task config for custom targets', function() {var expected, actual;
			var pkg = {};
			var config = {
				packages: {
					'package': {
						tasks: {
							'existing': {
								targets: {
									default: {
										message: 'Hello, world!'
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
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { existing: function(config) {}, task: function(config) {} };'
			};
			unmockFiles = mockFiles(files);

			return updateTaskConfig({
				package: 'package',
				task: 'task',
				target: 'custom',
				updates: {
					user: 'world'
				}
			})
				.then(function(returnValue) {
					actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
					expected = {
						packages: {
							'package': {
								tasks: {
									'existing': {
										targets: {
											default: {
												message: 'Hello, world!'
											}
										}
									},
									'task': {
										targets: {
											'custom': {
												user: 'world'
											}
										}
									}
								}
							}
						}
					};
					expect(actual).to.eql(expected);
				});
		});

		it('should update the external task config for the default target', function() {
			var pkg = {};
			var config = {
				packages: {
					'package': {
						tasks: {
							'task': {
								targets: {
									default: {
										message: 'Hello, world!'
									},
									'goodbye': {
										message: 'Goodbye, world!'
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
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: function(config) {} };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			return updateTaskConfig({
				package: 'package',
				task: 'task',
				updates: {
					user: 'world'
				}
			})
				.then(function(returnValue) {
					actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
					expected = {
						packages: {
							'package': {
								tasks: {
									'task': {
										targets: {
											default: {
												message: 'Hello, world!',
												user: 'world'
											},
											'goodbye': {
												message: 'Goodbye, world!'
											}
										}
									}
								}
							}
						}
					};
					expect(actual).to.eql(expected);
				});
		});

		it('should update the external task config for custom targets', function() {
			var pkg = {};
			var config = {
				packages: {
					'package': {
						tasks: {
							'task': {
								targets: {
									default: {
										message: 'Hello, world!'
									},
									'goodbye': {
										message: 'Goodbye, world!'
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
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: function(config) {} };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			return updateTaskConfig({
				package: 'package',
				task: 'task',
				target: 'goodbye',
				updates: {
					user: 'world'
				}
			})
				.then(function(returnValue) {
					actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
					expected = {
						packages: {
							'package': {
								tasks: {
									'task': {
										targets: {
											default: {
												message: 'Hello, world!'
											},
											'goodbye': {
												message: 'Goodbye, world!',
												user: 'world'
											}
										}
									}
								}
							}
						}
					};
					expect(actual).to.eql(expected);
				});
		});

		it('should update the external task config for new targets', function() {
			var pkg = {};
			var config = {
				packages: {
					'package': {
						tasks: {
							'task': {
								targets: {
									default: {
										message: 'Hello, world!'
									},
									'goodbye': {
										message: 'Goodbye, world!'
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
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: function(config) {} };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			return updateTaskConfig({
				package: 'package',
				task: 'task',
				target: 'bye',
				updates: {
					message: 'Bye, world!'
				}
			})
				.then(function(returnValue) {
					actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
					expected = {
						packages: {
							'package': {
								tasks: {
									'task': {
										targets: {
											default: {
												message: 'Hello, world!'
											},
											'goodbye': {
												message: 'Goodbye, world!'
											},
											'bye': {
												message: 'Bye, world!'
											}
										}
									}
								}
							}
						}
					};
					expect(actual).to.eql(expected);
				});
		});

		it('should return the updated external task config', function() {
			var pkg = {};
			var config = {
				packages: {
					'package': {
						tasks: {
							'task': {
								targets: {
									default: {
										message: 'Hello, world!'
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
				'/project/node_modules/@skivvy/skivvy-package-package/index.js': 'exports.tasks = { task: function(config) {} };'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = {
				message: 'Hello, world!',
				user: 'world'
			};
			actual = updateTaskConfig({
				package: 'package',
				task: 'task',
				updates: {
					user: 'world'
				}
			});
			return expect(actual).to.eventually.eql(expected);
		});
	});

	describe('events', function() {

		it('should dispatch task start and end events (local tasks)', function() {
			var pkg = {};
			var config = {
				tasks: {
					'task': {
						targets: {
							default: {
								message: 'Hello, world!'
							},
							goodbye: {
								message: 'Goodbye, world!'
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
					event: events.UPDATE_TASK_CONFIG_STARTED,
					task: 'task',
					target: 'goodbye',
					package: null,
					updates: {
						'user': 'world'
					},
					path: '/project'
				},
				{
					event: events.UPDATE_TASK_CONFIG_COMPLETED,
					config: {
						'message': 'Goodbye, world!',
						'user': 'world'
					},
					task: 'task',
					target: 'goodbye',
					package: null,
					updates: {
						'user': 'world'
					},
					path: '/project'
				}
			];
			actual = [];

			mockApi.on(events.UPDATE_TASK_CONFIG_STARTED, onStarted);
			mockApi.on(events.UPDATE_TASK_CONFIG_COMPLETED, onCompleted);
			mockApi.on(events.UPDATE_TASK_CONFIG_FAILED, onFailed);


			function onStarted(data) {
				actual.push({
					event: events.UPDATE_TASK_CONFIG_STARTED,
					task: data.task,
					target: data.target,
					package: data.package,
					updates: data.updates,
					path: data.path
				});
			}

			function onCompleted(data) {
				actual.push({
					event: events.UPDATE_TASK_CONFIG_COMPLETED,
					config: data.config,
					task: data.task,
					target: data.target,
					package: data.package,
					updates: data.updates,
					path: data.path
				});
			}

			function onFailed(data) {
				actual.push({
					event: events.UPDATE_TASK_CONFIG_FAILED,
					error: data.error,
					task: data.task,
					target: data.target,
					package: data.package,
					updates: data.updates,
					path: data.path
				});
			}

			return updateTaskConfig({
				task: 'task',
				target: 'goodbye',
				package: null,
				updates: {
					'user': 'world'
				},
				path: '/project'
			})
				.then(function() {
					return expect(actual).to.eql(expected);
				});
		});
	});
});
