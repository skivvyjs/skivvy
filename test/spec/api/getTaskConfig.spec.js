'use strict';

var chai = require('chai');
var expect = chai.expect;

var mockFiles = require('../../utils/mock-files');
var sharedTests = require('../sharedTests');

var InvalidTaskError = require('../../../lib/errors').InvalidTaskError;
var getTaskConfig = require('../../../lib/api/getTaskConfig');

sharedTests.addSyncProjectTests(getTaskConfig, 'api.getTaskConfig()');

describe('api.getTaskConfig()', function() {
	var unmockFiles = null;


	beforeEach(function() {
		var pkg = {
			name: 'hello-world',
			version: '1.0.1'
		};
		var config = {
			environment: {
				default: 'world',
				world: {
					user: 'world',
					symbol: '!',
					sender: '<%= project.name %>'
				},
				universe: {
					user: 'universe',
					symbol: '?',
					sender: '<%= project.name %>'
				}
			},
			tasks: {
				'local': {
					targets: {
						default: 'hello',
						'hello': {
							greeting: 'hello'
						},
						'secondary': {
							greeting: 'goodbye'
						},
						'custom': 'hi',
						'hi': {
							greeting: 'hi'
						}
					}
				},
				'default-targeter': {
					targets: {
						default: {
							greeting: 'hello'
						},
						'custom': {
							greeting: 'goodbye'
						}
					}
				},
				'expander': {
					targets: {
						default: {
							message: 'hello, <%= environment.user %><%= environment.symbol %>',
							sender: '<%= environment.sender %> v<%= project.version %>'
						},
						'secondary': {
							message: 'goodbye, <%= environment.user %><%= environment.symbol %>',
							sender: '<%= environment.sender %> v<%= project.version %>'
						}
					}
				},
				'multi': {
					targets: {
						default: [
							{
								name: 'multi:default:target1'
							},
							{
								name: 'multi:default:target2'
							},
							{
								name: 'multi:default:target3'
							}
						],
						'custom': [
							{
								name: 'multi:custom:target1'
							},
							{
								name: 'multi:custom:target2'
							},
							{
								name: 'multi:custom:target3'
							}
						]
					}
				},
				'chainer': {
					targets: {
						default: ['target1', 'target2', 'target4'],
						'target1': {
							name: 'chainer:default:target1'
						},
						'target2': {
							name: 'chainer:default:target2'
						},
						'target3': {
							name: 'chainer:default:target3'
						},
						'target4': {
							name: 'chainer:default:target4'
						},
						custom: ['customtarget1', 'customtarget2', 'customtarget4'],
						'customtarget1': {
							name: 'chainer:custom:target1'
						},
						'customtarget2': {
							name: 'chainer:custom:target2'
						},
						'customtarget3': {
							name: 'chainer:custom:target3'
						},
						'customtarget4': {
							name: 'chainer:custom:target4'
						}
					}
				}
			},
			packages: {
				'my-package': {
					config: {
						user: 'the <%= environment.user %>',
						sender: 'the <%= project.name %>'
					},
					tasks: {
						'~external': {
							targets: {
								default: {
									'~greeting': '~hello'
								},
								'~secondary': {
									'~greeting': '~goodbye'
								}
							}
						},
						'~targeter': {
							targets: {
								default: '~hello',
								'~hello': {
									'~greeting': '~hello'
								},
								'~secondary': {
									'~greeting': '~goodbye'
								},
								'~custom': '~hi',
								'~hi': {
									'~greeting': '~hi'
								}
							}
						},
						'~expander': {
							targets: {
								default: {
									'~message': '~hello, <%= package.user %><%= environment.symbol %>',
									'~sender': '~<%= package.sender %> v<%= project.version %>'
								},
								'~secondary': {
									'~message': '~goodbye, <%= package.user %><%= environment.symbol %>',
									'~sender': '~<%= package.sender %> v<%= project.version %>'
								}
							}
						},
						'~multi': {
							targets: {
								default: [
									{
										name: '~multi:default:target1'
									},
									{
										name: '~multi:default:target2'
									},
									{
										name: '~multi:default:target3'
									}
								],
								'~custom': [
									{
										name: '~multi:custom:target1'
									},
									{
										name: '~multi:custom:target2'
									},
									{
										name: '~multi:custom:target3'
									}
								]
							}
						},
						'~chainer': {
							targets: {
								default: ['~target1', '~target2', '~target4'],
								'~target1': {
									name: '~chainer:default:target1'
								},
								'~target2': {
									name: '~chainer:default:target2'
								},
								'~target3': {
									name: '~chainer:default:target3'
								},
								'~target4': {
									name: '~chainer:default:target4'
								},
								'~custom': ['~customtarget1', '~customtarget2', '~customtarget4'],
								'~customtarget1': {
									name: '~chainer:custom:target1'
								},
								'~customtarget2': {
									name: '~chainer:custom:target2'
								},
								'~customtarget3': {
									name: '~chainer:custom:target3'
								},
								'~customtarget4': {
									name: '~chainer:custom:target4'
								}
							}
						}
					}
				}
			}
		};
		var rootPkg = {
			name: 'goodbye-world',
			version: '1.2.3'
		};
		var rootConfig = {
			environment: {
				default: {}
			},
			tasks: {
				'/goodbye': {
					targets: {
						default: {
							'/user': '/world'
						}
					}
				}
			},
			packages: {}
		};
		var files = {
			'/package.json': JSON.stringify(rootPkg),
			'/.skivvyrc': JSON.stringify(rootConfig),
			'/skivvy_tasks/goodbye.js': 'module.exports = function(config) { };',
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/skivvy_tasks/local.js': 'module.exports = function(config) { };',
			'/project/skivvy_tasks/defaulter.js': 'module.exports = function(config) { }; module.exports.defaults = { \'user\': \'world\' };',
			'/project/skivvy_tasks/default-targeter.js': 'module.exports = function(config) { }; module.exports.defaults = { \'user\': \'world\' };',
			'/project/skivvy_tasks/default-expander.js': 'module.exports = function(config) { }; module.exports.defaults = { \'user\': \'Mr <%= environment.user %>\', \'version\': \'<%= project.version %>\' };',
			'/project/skivvy_tasks/expander.js': 'module.exports = function(config) { };',
			'/project/skivvy_tasks/multi.js': 'module.exports = function(config) { };',
			'/project/skivvy_tasks/chainer.js': 'module.exports = function(config) { };',
			'/project/node_modules/skivvy-package-my-package/package.json': '{ "name": "skivvy-package-my-package" }',
			'/project/node_modules/skivvy-package-my-package/index.js': 'exports.tasks = {' +
				'\'~external\': require(\'./tasks/external\'),' +
				'\'~targeter\': require(\'./tasks/targeter\'),' +
				'\'~expander\': require(\'./tasks/expander\'),' +
				'\'~multi\': require(\'./tasks/multi\'),' +
				'\'~chainer\': require(\'./tasks/chainer\')' +
			'};',
			'/project/node_modules/skivvy-package-my-package/tasks/external.js': 'module.exports = function(config) { };',
			'/project/node_modules/skivvy-package-my-package/tasks/targeter.js': 'module.exports = function(config) { };',
			'/project/node_modules/skivvy-package-my-package/tasks/expander.js': 'module.exports = function(config) { };',
			'/project/node_modules/skivvy-package-my-package/tasks/multi.js': 'module.exports = function(config) { };',
			'/project/node_modules/skivvy-package-my-package/tasks/chainer.js': 'module.exports = function(config) { };'
		};
		unmockFiles = mockFiles(files);
	});

	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
	});

	it('should throw an error if no task was specified', function() {
		var expected, actual;
		expected = InvalidTaskError;
		actual = [
			function() { getTaskConfig({ path: '/project' }); },
			function() { getTaskConfig({ task: undefined, path: '/project' }); },
			function() { getTaskConfig({ task: null, path: '/project' }); },
			function() { getTaskConfig({ task: false, path: '/project' }); },
			function() { getTaskConfig({ task: '', path: '/project' }); }
		];
		actual.forEach(function(actual) {
			expect(actual).to.throw(expected);
		});
	});

	it('should throw an error if the specified task does not exist', function() {
		var expected, actual;
		expected = InvalidTaskError;
		actual = function() {
			return getTaskConfig({
				task: 'goodbye',
				path: '/project'
			});
		};
		expect(actual).to.throw(expected);
	});

	it('should return a copy of default task config if the specified task config does not exist', function() {
		var expected, actual;
		expected = {
			user: 'world'
		};
		actual = getTaskConfig({
			task: 'defaulter',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should return a copy of default task config if the specified target does not exist', function() {
		var expected, actual;
		expected = {
			greeting: 'hello',
			user: 'world'
		};
		actual = getTaskConfig({
			task: 'default-targeter',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should extend the default task config if the default target exists', function() {
		var expected, actual;
		expected = {
			greeting: 'hello',
			user: 'world'
		};
		actual = getTaskConfig({
			task: 'default-targeter',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should extend the default task config if the specified custom target exists', function() {
		var expected, actual;
		expected = {
			greeting: 'goodbye',
			user: 'world'
		};
		actual = getTaskConfig({
			task: 'default-targeter',
			target: 'custom',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should return an empty object if the specified target does not exist and no default task config exists', function() {
		var expected, actual;
		expected = {};
		actual = getTaskConfig({
			task: 'local',
			target: 'tertiary',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should get local task config for default target', function() {
		var expected, actual;
		expected = {
			greeting: 'hello'
		};
		actual = getTaskConfig({
			task: 'local',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should get local task config for custom target', function() {
		var expected, actual;
		expected = {
			greeting: 'goodbye'
		};
		actual = getTaskConfig({
			task: 'local',
			target: 'secondary',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should get local task config for named default target', function() {
		var expected, actual;
		expected = {
			greeting: 'hello'
		};
		actual = getTaskConfig({
			task: 'local',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should get local task config for named custom target', function() {
		var expected, actual;
		expected = {
			greeting: 'hi'
		};
		actual = getTaskConfig({
			task: 'local',
			target: 'custom',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should get local task config for default target objects array', function() {
		var expected, actual;
		expected = [
			{
				name: 'multi:default:target1'
			},
			{
				name: 'multi:default:target2'
			},
			{
				name: 'multi:default:target3'
			}
		];
		actual = getTaskConfig({
			task: 'multi',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should get local task config for custom target objects array', function() {
		var expected, actual;
		expected = [
			{
				name: 'multi:custom:target1'
			},
			{
				name: 'multi:custom:target2'
			},
			{
				name: 'multi:custom:target3'
			}
		];
		actual = getTaskConfig({
			task: 'multi',
			target: 'custom',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should get local task config for default target names array', function() {
		var expected, actual;
		expected = [
			{
				name: 'chainer:default:target1'
			},
			{
				name: 'chainer:default:target2'
			},
			{
				name: 'chainer:default:target4'
			}
		];
		actual = getTaskConfig({
			task: 'chainer',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should get local task config for custom target names array', function() {
		var expected, actual;
		expected = [
			{
				name: 'chainer:custom:target1'
			},
			{
				name: 'chainer:custom:target2'
			},
			{
				name: 'chainer:custom:target4'
			}
		];
		actual = getTaskConfig({
			task: 'chainer',
			target: 'custom',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should get external task config for default target', function() {
		var expected, actual;
		expected = {
			'~greeting': '~hello'
		};
		actual = getTaskConfig({
			task: '~external',
			package: 'my-package',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should get external task config for custom target', function() {
		var expected, actual;
		expected = {
			'~greeting': '~goodbye'
		};
		actual = getTaskConfig({
			task: '~external',
			package: 'my-package',
			target: '~secondary',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should get external task config for named default target', function() {
		var expected, actual;
		expected = {
			'~greeting': '~hello'
		};
		actual = getTaskConfig({
			task: '~targeter',
			package: 'my-package',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should get external task config for named custom target', function() {
		var expected, actual;
		expected = {
			'~greeting': '~hi'
		};
		actual = getTaskConfig({
			task: '~targeter',
			target: '~custom',
			package: 'my-package',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should get external task config for default target objects array', function() {
		var expected, actual;
		expected = [
			{
				name: '~multi:default:target1'
			},
			{
				name: '~multi:default:target2'
			},
			{
				name: '~multi:default:target3'
			}
		];
		actual = getTaskConfig({
			task: '~multi',
			package: 'my-package',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should get external task config for custom target objects array', function() {
		var expected, actual;
		expected = [
			{
				name: '~multi:custom:target1'
			},
			{
				name: '~multi:custom:target2'
			},
			{
				name: '~multi:custom:target3'
			}
		];
		actual = getTaskConfig({
			task: '~multi',
			target: '~custom',
			package: 'my-package',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should get external task config for default target names array', function() {
		var expected, actual;
		expected = [
			{
				name: '~chainer:default:target1'
			},
			{
				name: '~chainer:default:target2'
			},
			{
				name: '~chainer:default:target4'
			}
		];
		actual = getTaskConfig({
			task: '~chainer',
			package: 'my-package',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should get external task config for custom target names array', function() {
		var expected, actual;
		expected = [
			{
				name: '~chainer:custom:target1'
			},
			{
				name: '~chainer:custom:target2'
			},
			{
				name: '~chainer:custom:target4'
			}
		];
		actual = getTaskConfig({
			task: '~chainer',
			target: '~custom',
			package: 'my-package',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should prevent expanding of local task config placeholders', function() {
		var expected, actual;
		expected = {
			'message': 'hello, <%= environment.user %><%= environment.symbol %>',
			'sender': '<%= environment.sender %> v<%= project.version %>'
		};
		actual = getTaskConfig({
			task: 'expander',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should expand local task config placeholders', function() {
		var expected, actual;
		expected = {
			'message': 'hello, world!',
			'sender': 'hello-world v1.0.1'
		};
		actual = getTaskConfig({
			task: 'expander',
			path: '/project',
			expand: true
		});
		expect(actual).to.eql(expected);
	});

	it('should expand local task config placeholders for custom environment', function() {
		var expected, actual;
		expected = {
			'message': 'hello, universe?',
			'sender': 'hello-world v1.0.1'
		};
		actual = getTaskConfig({
			task: 'expander',
			environment: 'universe',
			path: '/project',
			expand: true
		});
		expect(actual).to.eql(expected);
	});

	it('should prevent expanding of external task config placeholders', function() {
		var expected, actual;
		expected = {
			'~message': '~hello, <%= package.user %><%= environment.symbol %>',
			'~sender': '~<%= package.sender %> v<%= project.version %>'
		};
		actual = getTaskConfig({
			task: '~expander',
			package: 'my-package',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should expand external task config placeholders', function() {
		var expected, actual;
		expected = {
			'~message': '~hello, the world!',
			'~sender': '~the hello-world v1.0.1'
		};
		actual = getTaskConfig({
			task: '~expander',
			package: 'my-package',
			path: '/project',
			expand: true
		});
		expect(actual).to.eql(expected);
	});

	it('should expand external task config placeholders for custom environment', function() {
		var expected, actual;
		expected = {
			'~message': '~hello, the universe?',
			'~sender': '~the hello-world v1.0.1'
		};
		actual = getTaskConfig({
			task: '~expander',
			package: 'my-package',
			environment: 'universe',
			path: '/project',
			expand: true
		});
		expect(actual).to.eql(expected);
	});

	it('should default to process.cwd() if no path is specified', function() {
		var expected, actual;
		expected = {
			'/user': '/world'
		};
		actual = getTaskConfig({
			task: '/goodbye'
		});
		expect(actual).to.eql(expected);
	});
});
