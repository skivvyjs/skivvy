'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var fs = require('fs');
var Promise = require('promise');

var sharedTests = require('../sharedTests');
var mockFiles = require('../../utils/mock-files');

var api = require('../../../lib/api');
var events = require('../../../lib/events');

var InvalidTaskError = require('../../../lib/errors').InvalidTaskError;
var InvalidConfigError = require('../../../lib/errors').InvalidConfigError;

var updateTaskConfig = require('../../../lib/api/updateTaskConfig');

chai.use(chaiAsPromised);

sharedTests.addAsyncProjectTests(updateTaskConfig, 'api.updateTaskConfig()');

describe('api.updateTaskConfig()', function() {
	var unmockFiles = null;

	beforeEach(function() {
		var pkg = {

		};
		var config = {
			environment: {
				default: {}
			},
			tasks: {
				'existing': {
					targets: {
						default: {
							'status': 'pre-existing'
						},
						'alternate': {
							'state': 'pre-defined'
						}
					}
				}
			},
			packages: {
				'my-package': {
					config: {},
					tasks: {
						'~existing': {
							targets: {
								default: {
									'~status': '~pre-existing'
								},
								'~alternate': {
									'~state': '~pre-defined'
								}
							}
						}
					}
				}
			}
		};
		var rootPkg = {};
		var rootConfig = {
			environment: {
				default: {},
			},
			tasks: {
				'existing': {
					targets: {
						default: {
							'status': 'pre-existing'
						}
					}
				}
			}
		};
		unmockFiles = mockFiles({
			'/package.json': JSON.stringify(rootPkg),
			'/.skivvyrc': JSON.stringify(rootConfig),
			'/skivvy_tasks/local.js': 'module.exports = function(config) { };',
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/skivvy_tasks/local.js': 'module.exports = function(config) { };',
			'/project/skivvy_tasks/existing.js': 'module.exports = function(config) { };',
			'/project/node_modules/skivvy-package-my-package/index.js': 'exports.tasks = { \'~external\': require(\'./tasks/external\'), \'~existing\': require(\'./tasks/existing\') };',
			'/project/node_modules/skivvy-package-my-package/tasks/external.js': 'module.exports = function(config) { };',
			'/project/node_modules/skivvy-package-my-package/tasks/existing.js': 'module.exports = function(config) { };',
			'/project/node_modules/skivvy-package-my-package-2/index.js': 'exports.tasks = { \'hidden\': require(\'./tasks/hidden\') };',
			'/project/node_modules/skivvy-package-my-package-2/tasks/hidden.js': 'module.exports = function(config) { };',
			'/project/node_modules/@my-packages/skivvy-package-my-package/index.js': 'exports.tasks = { \'scoped\': require(\'./tasks/scoped\') };',
			'/project/node_modules/@my-packages/skivvy-package-my-package/tasks/scoped.js': 'module.exports = function(config) { };'
		});
	});

	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
	});

	it('should throw an error if no task name was specified', function() {
		var expected, actual;
		expected = InvalidTaskError;
		actual = [
			updateTaskConfig({ path: '/project' }),
			updateTaskConfig({ task: undefined, path: '/project' }),
			updateTaskConfig({ task: null, path: '/project' }),
			updateTaskConfig({ task: false, path: '/project' }),
			updateTaskConfig({ task: '', path: '/project' })
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
	});

	it('should throw an error if the specified task does not exist', function() {
		var expected, actual;
		expected = InvalidTaskError;
		actual = updateTaskConfig({
			task: 'nonexistent',
			path: '/project'
		});
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should throw an error if no config object was specified', function() {
		var expected, actual;
		expected = InvalidConfigError;
		actual = [
			updateTaskConfig({ task: 'local', path: '/project' }),
			updateTaskConfig({ updates: undefined, task: 'local', path: '/project' }),
			updateTaskConfig({ updates: null, task: 'local', path: '/project' }),
			updateTaskConfig({ updates: false, task: 'local', path: '/project' }),
			updateTaskConfig({ updates: '', task: 'local', path: '/project' })
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
	});

	it('should create the local task config for the default target', function() {
		var expected, actual;
		return updateTaskConfig({
			task: 'local',
			updates: {
				user: 'world'
			},
			path: '/project'
		})
			.then(function(returnValue) {
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expected = {
					environment: {
						default: {}
					},
					tasks: {
						'existing': {
							targets: {
								default: {
									status: 'pre-existing'
								},
								'alternate': {
									state: 'pre-defined'
								}
							}
						},
						'local': {
							targets: {
								default: {
									user: 'world'
								}
							}
						}
					},
					packages: {
						'my-package': {
							config: {},
							tasks: {
								'~existing': {
									targets: {
										default: {
											'~status': '~pre-existing'
										},
										'~alternate': {
											'~state': '~pre-defined'
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

	it('should create the local task config for custom targets', function() {var expected, actual;
		return updateTaskConfig({
			task: 'local',
			target: 'custom',
			updates: {
				user: 'world'
			},
			path: '/project'
		})
			.then(function(returnValue) {
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expected = {
					environment: {
						default: {}
					},
					tasks: {
						'existing': {
							targets: {
								default: {
									status: 'pre-existing'
								},
								'alternate': {
									state: 'pre-defined'
								}
							}
						},
						'local': {
							targets: {
								default: {},
								'custom': {
									user: 'world'
								}
							}
						}
					},
					packages: {
						'my-package': {
							config: {},
							tasks: {
								'~existing': {
									targets: {
										default: {
											'~status': '~pre-existing'
										},
										'~alternate': {
											'~state': '~pre-defined'
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

	it('should update the local task config for the default target', function() {
		var expected, actual;
		return updateTaskConfig({
			task: 'existing',
			updates: {
				user: 'world'
			},
			path: '/project'
		})
			.then(function(returnValue) {
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expected = {
					environment: {
						default: {}
					},
					tasks: {
						'existing': {
							targets: {
								default: {
									status: 'pre-existing',
									user: 'world'
								},
								'alternate': {
									state: 'pre-defined'
								}
							}
						}
					},
					packages: {
						'my-package': {
							config: {},
							tasks: {
								'~existing': {
									targets: {
										default: {
											'~status': '~pre-existing'
										},
										'~alternate': {
											'~state': '~pre-defined'
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

	it('should update the local task config for custom targets', function() {
		var expected, actual;
		return updateTaskConfig({
			task: 'existing',
			target: 'alternate',
			updates: {
				user: 'world'
			},
			path: '/project'
		})
			.then(function(returnValue) {
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expected = {
					environment: {
						default: {}
					},
					tasks: {
						'existing': {
							targets: {
								default: {
									status: 'pre-existing'
								},
								'alternate': {
									state: 'pre-defined',
									user: 'world'
								}
							}
						}
					},
					packages: {
						'my-package': {
							config: {},
							tasks: {
								'~existing': {
									targets: {
										default: {
											'~status': '~pre-existing'
										},
										'~alternate': {
											'~state': '~pre-defined'
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

	it('should update the local task config for new targets', function() {
		var expected, actual;
		return updateTaskConfig({
			task: 'existing',
			target: 'pristine',
			updates: {
				user: 'world'
			},
			path: '/project'
		})
			.then(function(returnValue) {
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expected = {
					environment: {
						default: {}
					},
					tasks: {
						'existing': {
							targets: {
								default: {
									status: 'pre-existing'
								},
								'alternate': {
									state: 'pre-defined'
								},
								'pristine': {
									user: 'world'
								}
							}
						}
					},
					packages: {
						'my-package': {
							config: {},
							tasks: {
								'~existing': {
									targets: {
										default: {
											'~status': '~pre-existing'
										},
										'~alternate': {
											'~state': '~pre-defined'
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

	it('should return the updated local task config', function() {
		var expected, actual;
		expected = {
			user: 'world'
		};
		actual = updateTaskConfig({
			task: 'local',
			target: 'custom',
			updates: {
				user: 'world'
			},
			path: '/project'
		});
		return expect(actual).to.eventually.eql(expected);
	});

	it('should create the external task config for the default target', function() {
		var expected, actual;
		return updateTaskConfig({
			task: '~external',
			package: 'my-package',
			updates: {
				'~user': '~world'
			},
			path: '/project'
		})
			.then(function(returnValue) {
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expected = {
					environment: {
						default: {}
					},
					tasks: {
						'existing': {
							targets: {
								default: {
									status: 'pre-existing'
								},
								'alternate': {
									state: 'pre-defined'
								}
							}
						}
					},
					packages: {
						'my-package': {
							config: {},
							tasks: {
								'~existing': {
									targets: {
										default: {
											'~status': '~pre-existing'
										},
										'~alternate': {
											'~state': '~pre-defined'
										}
									}
								},
								'~external': {
									targets: {
										default: {
											'~user': '~world'
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
		return updateTaskConfig({
			task: '~external',
			target: '~custom',
			package: 'my-package',
			updates: {
				'~user': '~world'
			},
			path: '/project'
		})
			.then(function(returnValue) {
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expected = {
					environment: {
						default: {}
					},
					tasks: {
						'existing': {
							targets: {
								default: {
									status: 'pre-existing'
								},
								'alternate': {
									state: 'pre-defined'
								}
							}
						}
					},
					packages: {
						'my-package': {
							config: {},
							tasks: {
								'~existing': {
									targets: {
										default: {
											'~status': '~pre-existing'
										},
										'~alternate': {
											'~state': '~pre-defined'
										}
									}
								},
								'~external': {
									targets: {
										default: {},
										'~custom': {
											'~user': '~world'
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
		var expected, actual;
		return updateTaskConfig({
			task: '~existing',
			package: 'my-package',
			updates: {
				'~user': '~world'
			},
			path: '/project'
		})
			.then(function(returnValue) {
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expected = {
					environment: {
						default: {}
					},
					tasks: {
						'existing': {
							targets: {
								default: {
									status: 'pre-existing'
								},
								'alternate': {
									state: 'pre-defined'
								}
							}
						}
					},
					packages: {
						'my-package': {
							config: {},
							tasks: {
								'~existing': {
									targets: {
										default: {
											'~status': '~pre-existing',
											'~user': '~world'
										},
										'~alternate': {
											'~state': '~pre-defined'
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
		var expected, actual;
		return updateTaskConfig({
			task: '~existing',
			target: '~alternate',
			package: 'my-package',
			updates: {
				'~user': '~world'
			},
			path: '/project'
		})
			.then(function(returnValue) {
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expected = {
					environment: {
						default: {}
					},
					tasks: {
						'existing': {
							targets: {
								default: {
									status: 'pre-existing'
								},
								'alternate': {
									state: 'pre-defined'
								}
							}
						}
					},
					packages: {
						'my-package': {
							config: {},
							tasks: {
								'~existing': {
									targets: {
										default: {
											'~status': '~pre-existing'
										},
										'~alternate': {
											'~state': '~pre-defined',
											'~user': '~world'
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
		var expected, actual;
		return updateTaskConfig({
			task: '~existing',
			target: '~pristine',
			package: 'my-package',
			updates: {
				'~user': '~world'
			},
			path: '/project'
		})
			.then(function(returnValue) {
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expected = {
					environment: {
						default: {}
					},
					tasks: {
						'existing': {
							targets: {
								default: {
									status: 'pre-existing'
								},
								'alternate': {
									state: 'pre-defined'
								}
							}
						}
					},
					packages: {
						'my-package': {
							config: {},
							tasks: {
								'~existing': {
									targets: {
										default: {
											'~status': '~pre-existing'
										},
										'~alternate': {
											'~state': '~pre-defined'
										},
										'~pristine': {
											'~user': '~world'
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
		var expected, actual;
		expected = {
			'~user': '~world'
		};
		actual = updateTaskConfig({
			task: '~external',
			package: 'my-package',
			target: '~custom',
			updates: {
				'~user': '~world'
			},
			path: '/project'
		});
		return expect(actual).to.eventually.eql(expected);
	});

	it('should default to process.cwd() if no path is specified', function() {
		var expected, actual;
		expected = {
			user: 'world'
		};
		return updateTaskConfig({
			task: 'local',
			target: 'custom',
			updates: {
				user: 'world'
			}
		})
			.then(function() {
				actual = JSON.parse(fs.readFileSync('/.skivvyrc', 'utf8'));
				expected = {
					environment: {
						default: {},
					},
					tasks: {
						'existing': {
							targets: {
								default: {
									'status': 'pre-existing'
								}
							}
						},
						'local': {
							targets: {
								default: {},
								custom: {
									'user': 'world'
								}
							}
						}
					}
				};
				expect(actual).to.eql(expected);
			});
	});

	it('should dispatch task start and end events', function() {
		var expected, actual;
		expected = [
			{
				event: events.UPDATE_TASK_CONFIG_STARTED,
				task: '~external',
				target: '~custom',
				package: 'my-package',
				updates: {
					'~user': '~world'
				},
				path: '/project'
			},
			{
				event: events.UPDATE_TASK_CONFIG_COMPLETED,
				config: {
					'~user': '~world'
				},
				task: '~external',
				target: '~custom',
				package: 'my-package',
				updates: {
					'~user': '~world'
				},
				path: '/project'
			}
		];
		actual = [];

		api.on(events.UPDATE_TASK_CONFIG_STARTED, onStarted);
		api.on(events.UPDATE_TASK_CONFIG_COMPLETED, onCompleted);
		api.on(events.UPDATE_TASK_CONFIG_FAILED, onFailed);


		function onStarted(data) {
			actual.push({
				event: events.UPDATE_TASK_CONFIG_STARTED,
				task: data.task,
				target: data.target,
				package: data.package,
				updates: data.updates,
				path: data.path,
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
			task: '~external',
			target: '~custom',
			package: 'my-package',
			updates: {
				'~user': '~world'
			},
			path: '/project'
		})
			.then(function() {
				return expect(actual).to.eql(expected);
			})
			.finally(function() {
				api.removeListener(events.UPDATE_TASK_CONFIG_STARTED, onStarted);
				api.removeListener(events.UPDATE_TASK_CONFIG_COMPLETED, onCompleted);
				api.removeListener(events.UPDATE_TASK_CONFIG_FAILED, onFailed);
			});
	});
});
