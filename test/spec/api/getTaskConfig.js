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
				'hello': {
					targets: {
						default: {
							greeting: 'hello'
						},
						'secondary': {
							greeting: 'goodbye'
						}
					}
				},
				'greet': {
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
						'~hello': {
							targets: {
								default: {
									'~greeting': '~hello'
								},
								'~secondary': {
									'~greeting': '~goodbye'
								}
							}
						},
						'~greet': {
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
			'/skivvy.json': JSON.stringify(rootConfig),
			'/project/package.json': JSON.stringify(pkg),
			'/project/skivvy.json': JSON.stringify(config)
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

	it('should return an empty object if the specified task does not exist', function() {
		var expected, actual;
		expected = {};
		actual = getTaskConfig({
			task: 'goodbye',
			path: '/project'
		});
		expect(actual).to.eql(expected);
	});

	it('should return an empty object if the specified target does not exist', function() {
		var expected, actual;
		expected = {};
		actual = getTaskConfig({
			task: 'hello',
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
			task: 'hello',
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
			task: 'hello',
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
			task: 'greet',
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
			task: 'greet',
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
			task: '~hello',
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
			task: '~hello',
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
			task: '~greet',
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
			task: '~greet',
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
