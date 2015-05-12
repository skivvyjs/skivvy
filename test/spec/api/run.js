'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var Promise = require('promise');
var Stream = require('stream');

var mockFiles = require('../../utils/mock-files');

var InvalidTaskError = require('../../../lib/errors').InvalidTaskError;
var InvalidProjectError = require('../../../lib/errors').InvalidProjectError;

var api = require('../../../lib/api');
var events = require('../../../lib/events');

var run = require('../../../lib/api/run');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('api.run()', function() {
	var unmockFiles;

	beforeEach(function() {
		var pkg = {
			name: 'hello-world'
		};
		var config = {
			environment: {
				default: {
					greeting: 'Hello',
					user: 'world'
				},
				'goodbye': {
					greeting: 'Goodbye',
					user: 'world'
				}
			},
			tasks: {
				'local': {
					targets: {
						default: {
							message: 'local - Hello, world!'
						}
					}
				},
				'expander': {
					targets: {
						default: {
							message: 'local:expander:default - <%= environment.greeting %>, <%= environment.user %>!'
						},
						alternate: {
							message: 'local:expander:alternate - <%= environment.greeting %>, <%= environment.user %>!'
						}
					}
				},
				'defaulter': {
					targets: {
						default: 'alternate',
						alternate: {
							message: 'local:defaulter:alternate - <%= environment.greeting %>, <%= environment.user %>!'
						},
						custom: 'customalternate',
						customalternate: {
							message: 'local:defaulter:customalternate - <%= environment.greeting %>, <%= environment.user %>!'
						}
					}
				},
				'chainer': {
					targets: {
						default: ['step0', 'step1', 'step3'],
						step0: {
							message: 'local:chainer:step0 - <%= environment.greeting %>, <%= environment.user %>!',
							index: 0
						},
						step1: {
							message: 'local:chainer:step1 - <%= environment.greeting %>, <%= environment.user %>!',
							index: 1
						},
						step2: {
							message: 'local:chainer:step2 - <%= environment.greeting %>, <%= environment.user %>!',
							index: 2
						},
						step3: {
							message: 'local:chainer:step3 - <%= environment.greeting %>, <%= environment.user %>!',
							index: 3
						},
						custom: ['customstep0', 'customstep1', 'customstep3'],
						customstep0: {
							message: 'local:chainer:customstep0 - <%= environment.greeting %>, <%= environment.user %>!',
							index: 0
						},
						customstep1: {
							message: 'local:chainer:customstep1 - <%= environment.greeting %>, <%= environment.user %>!',
							index: 1
						},
						customstep2: {
							message: 'local:chainer:customstep2 - <%= environment.greeting %>, <%= environment.user %>!',
							index: 2
						},
						customstep3: {
							message: 'local:chainer:customstep3 - <%= environment.greeting %>, <%= environment.user %>!',
							index: 3
						},
					}
				},
				'series': {
					targets: {
						default: {
							message: 'series - <%= environment.greeting %>, <%= environment.user %>!'
						}
					}
				}
			},
			packages: {
				'my-package': {
					config: {
						message: '<%= environment.greeting %>, <%= environment.user %>!'
					},
					tasks: {
						'external': {
							targets: {
								default: {
									message: 'external - Hello, world!'
								}
							}
						},
						'expander': {
							targets: {
								default: {
									message: 'external:expander:default - <%= package.message %>'
								},
								alternate: {
									message: 'external:expander:alternate - <%= package.message %>'
								}
							}
						},
						'defaulter': {
							targets: {
								default: 'alternate',
								alternate: {
									message: 'external:defaulter:alternate - <%= package.message %>'
								},
								custom: 'customalternate',
								customalternate: {
									message: 'external:defaulter:customalternate - <%= package.message %>'
								}
							}
						},
						'chainer': {
							targets: {
								default: ['step0', 'step1', 'step3'],
								step0: {
									message: 'external:chainer:step0 - <%= package.message %>',
									index: 0
								},
								step1: {
									message: 'external:chainer:step1 - <%= package.message %>',
									index: 1
								},
								step2: {
									message: 'external:chainer:step2 - <%= package.message %>',
									index: 2
								},
								step3: {
									message: 'external:chainer:step3 - <%= package.message %>',
									index: 3
								},
								custom: ['customstep0', 'customstep1', 'customstep3'],
								customstep0: {
									message: 'external:chainer:customstep0 - <%= package.message %>',
									index: 0
								},
								customstep1: {
									message: 'external:chainer:customstep1 - <%= package.message %>',
									index: 1
								},
								customstep2: {
									message: 'external:chainer:customstep2 - <%= package.message %>',
									index: 2
								},
								customstep3: {
									message: 'external:chainer:customstep3 - <%= package.message %>',
									index: 3
								},
							}
						},
						'series': {
							targets: {
								default: {
									message: 'external:series - <%= environment.greeting %>, <%= environment.user %>!'
								}
							}
						}
					}
				},
				'@my-packages/my-package': {
					config: {
						message: '<%= environment.greeting %>, <%= environment.user %>!'
					},
					tasks: {
						'scoped': {
							targets: {
								default: {
									message: 'scoped - Hello, world!'
								}
							}
						},
						'expander': {
							targets: {
								default: {
									message: 'scoped:expander:default - <%= package.message %>'
								},
								alternate: {
									message: 'scoped:expander:alternate - <%= package.message %>'
								}
							}
						},
						'defaulter': {
							targets: {
								default: 'alternate',
								alternate: {
									message: 'scoped:defaulter:alternate - <%= package.message %>'
								},
								custom: 'customalternate',
								customalternate: {
									message: 'scoped:defaulter:customalternate - <%= package.message %>'
								}
							}
						},
						'chainer': {
							targets: {
								default: ['step0', 'step1', 'step3'],
								step0: {
									message: 'scoped:chainer:step0 - <%= package.message %>',
									index: 0
								},
								step1: {
									message: 'scoped:chainer:step1 - <%= package.message %>',
									index: 1
								},
								step2: {
									message: 'scoped:chainer:step2 - <%= package.message %>',
									index: 2
								},
								step3: {
									message: 'scoped:chainer:step3 - <%= package.message %>',
									index: 3
								},
								custom: ['customstep0', 'customstep1', 'customstep3'],
								customstep0: {
									message: 'scoped:chainer:customstep0 - <%= package.message %>',
									index: 0
								},
								customstep1: {
									message: 'scoped:chainer:customstep1 - <%= package.message %>',
									index: 1
								},
								customstep2: {
									message: 'scoped:chainer:customstep2 - <%= package.message %>',
									index: 2
								},
								customstep3: {
									message: 'scoped:chainer:customstep3 - <%= package.message %>',
									index: 3
								},
							}
						},
						'series': {
							targets: {
								default: {
									message: 'scoped:series - <%= environment.greeting %>, <%= environment.user %>!'
								}
							}
						}
					}
				}
			}
		};
		var files = {
			'package.json': JSON.stringify(pkg),
			'skivvy.json': JSON.stringify(config),
			'skivvy_tasks/local.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } return \'local\'; }; module.exports.callback = null;',
			'skivvy_tasks/expander.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } return \'local:expander\'; }; module.exports.callback = null;',
			'skivvy_tasks/defaulter.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } return \'local:defaulter\'; }; module.exports.callback = null;',
			'skivvy_tasks/chainer.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } return \'local:chainer\' + config.index; }; module.exports.callback = null;',
			'skivvy_tasks/series.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } return \'local:series\'; }; module.exports.callback = null;',
			'node_modules/skivvy-package-my-package/index.js': 'exports.tasks = { \'external\': require(\'./tasks/external\'), \'expander\': require(\'./tasks/expander\'), \'defaulter\': require(\'./tasks/defaulter\'), \'chainer\': require(\'./tasks/chainer\'), \'series\': require(\'./tasks/series\') };',
			'node_modules/skivvy-package-my-package/tasks/external.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } return \'external\'; }; module.exports.callback = null;',
			'node_modules/skivvy-package-my-package/tasks/expander.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } return \'external:expander\'; }; module.exports.callback = null;',
			'node_modules/skivvy-package-my-package/tasks/defaulter.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } return \'external:defaulter\'; }; module.exports.callback = null;',
			'node_modules/skivvy-package-my-package/tasks/chainer.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } return \'external:chainer\' + config.index; }; module.exports.callback = null;',
			'node_modules/skivvy-package-my-package/tasks/series.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } return \'external:series\'; }; module.exports.callback = null;',
			'node_modules/@my-packages/skivvy-package-my-package/index.js': 'exports.tasks = { \'scoped\': require(\'./tasks/scoped\'), \'expander\': require(\'./tasks/expander\'), \'defaulter\': require(\'./tasks/defaulter\'), \'chainer\': require(\'./tasks/chainer\'), \'series\': require(\'./tasks/series\') };',
			'node_modules/@my-packages/skivvy-package-my-package/tasks/scoped.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } return \'scoped\'; }; module.exports.callback = null;',
			'node_modules/@my-packages/skivvy-package-my-package/tasks/expander.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } return \'scoped:expander\'; }; module.exports.callback = null;',
			'node_modules/@my-packages/skivvy-package-my-package/tasks/defaulter.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } return \'scoped:defaulter\'; }; module.exports.callback = null;',
			'node_modules/@my-packages/skivvy-package-my-package/tasks/chainer.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } return \'scoped:chainer\' + config.index; }; module.exports.callback = null;',
			'node_modules/@my-packages/skivvy-package-my-package/tasks/series.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } return \'scoped:series\'; }; module.exports.callback = null;',
			'/project/package.json': JSON.stringify(pkg),
			'/project/skivvy.json': JSON.stringify(config),
			'/project/skivvy_tasks/custom.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } return \'local\'; }; module.exports.callback = null;',
			'/project/node_modules/skivvy-package-my-package/index.js': 'exports.tasks = { \'custom\': require(\'./tasks/custom\') };',
			'/project/node_modules/skivvy-package-my-package/tasks/custom.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } return \'external\'; }; module.exports.callback = null;',
			'/project/node_modules/@my-packages/skivvy-package-my-package/index.js': 'exports.tasks = { \'custom\': require(\'./tasks/custom\') };',
			'/project/node_modules/@my-packages/skivvy-package-my-package/tasks/custom.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } return \'scoped\'; }; module.exports.callback = null;',
			'/other': {}
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
			run(),
			run({ task: undefined }),
			run({ task: null }),
			run({ task: false }),
			run({ task: '' })
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
	});

	it('should throw an error if an invalid task name was specified', function() {
		var expected, actual;
		expected = InvalidTaskError;
		actual = run({
			task: 'nonexistent'
		});
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should throw an error if an invalid path was specified', function() {
		var expected = InvalidProjectError;
		var actual = run({
			task: 'local',
			path: '/invalid'
		});
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should run local tasks with default target config', function() {
		var expectedTask = require('/skivvy_tasks/local');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'local - Hello, world!'
		};
		return run({
			task: 'local'
		})
			.then(function() {
				expect(spy).to.have.been.calledWith(expectedConfig);
			});
	});

	it('should expand default environment placeholders in local task config', function() {
		var expectedTask = require('/skivvy_tasks/expander');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'local:expander:default - Hello, world!'
		};
		return run({
			task: 'expander'
		})
			.then(function() {
				expect(spy).to.have.been.calledWith(expectedConfig);
			});
	});

	it('should expand custom environment placeholders in local task config', function() {
		var expectedTask = require('/skivvy_tasks/expander');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'local:expander:default - Goodbye, world!'
		};
		return run({
			task: 'expander',
			environment: 'goodbye'
		})
			.then(function() {
				expect(spy).to.have.been.calledWith(expectedConfig);
			});
	});

	it('should run local tasks with custom target config', function() {
		var expectedTask = require('/skivvy_tasks/expander');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'local:expander:alternate - Goodbye, world!'
		};
		return run({
			task: 'expander',
			target: 'alternate',
			environment: 'goodbye'
		})
			.then(function() {
				expect(spy).to.have.been.calledWith(expectedConfig);
			});
	});

	it('should run local tasks with overridden config', function() {
		var expectedTask = require('/skivvy_tasks/expander');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'local:expander:default - Hello, world!',
			override: true
		};
		return run({
			task: 'expander',
			config: {
				override: true
			}
		})
			.then(function() {
				expect(spy).to.have.been.calledWith(expectedConfig);
			});
	});

	it('should run local tasks with overridden custom environment config', function() {
		var expectedTask = require('/skivvy_tasks/expander');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'local:expander:default - Goodbye, world!',
			override: true
		};
		return run({
			task: 'expander',
			environment: 'goodbye',
			config: {
				override: true
			}
		})
			.then(function() {
				expect(spy).to.have.been.calledWith(expectedConfig);
			});
	});

	it('should run local tasks with named default target', function() {
		var expectedTask = require('/skivvy_tasks/defaulter');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'local:defaulter:alternate - Goodbye, world!',
			override: true
		};
		var expectedResults = 'local:defaulter';
		return run({
			task: 'defaulter',
			environment: 'goodbye',
			config: {
				override: true
			}
		})
			.then(function(returnValue) {
				expect(spy).to.have.been.calledWith(expectedConfig);

				var expected = expectedResults;
				var actual = returnValue;
				expect(actual).to.eql(expected);
			});
	});

	it('should run local tasks with named custom target', function() {
		var expectedTask = require('/skivvy_tasks/defaulter');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'local:defaulter:customalternate - Goodbye, world!',
			override: true
		};
		var expectedResults = 'local:defaulter';
		return run({
			task: 'defaulter',
			target: 'custom',
			environment: 'goodbye',
			config: {
				override: true
			}
		})
			.then(function(returnValue) {
				expect(spy).to.have.been.calledWith(expectedConfig);

				var expected = expectedResults;
				var actual = returnValue;
				expect(actual).to.eql(expected);
			});
	});

	it('should run local tasks with multiple default targets', function() {
		var expectedTask = require('/skivvy_tasks/chainer');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = [
			{
				message: 'local:chainer:step0 - Goodbye, world!',
				index: 0,
				override: true
			},
			{
				message: 'local:chainer:step1 - Goodbye, world!',
				index: 1,
				override: true
			},
			{
				message: 'local:chainer:step3 - Goodbye, world!',
				index: 3,
				override: true
			}
		];
		var expectedResults = [
			'local:chainer0',
			'local:chainer1',
			'local:chainer3'
		];
		return run({
			task: 'chainer',
			environment: 'goodbye',
			config: {
				override: true
			}
		})
			.then(function(returnValue) {
				expect(spy).to.have.callCount(3);
				expect(spy).to.have.been.calledWith(expectedConfig[0]);
				expect(spy).to.have.been.calledWith(expectedConfig[1]);
				expect(spy).to.have.been.calledWith(expectedConfig[2]);

				var expected = expectedResults;
				var actual = returnValue;
				expect(actual).to.eql(expected);
			});
	});

	it('should run local tasks with multiple custom targets', function() {
		var expectedTask = require('/skivvy_tasks/chainer');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = [
			{
				message: 'local:chainer:customstep0 - Goodbye, world!',
				index: 0
			},
			{
				message: 'local:chainer:customstep1 - Goodbye, world!',
				index: 1
			},
			{
				message: 'local:chainer:customstep3 - Goodbye, world!',
				index: 3
			}
		];
		var expectedResults = [
			'local:chainer0',
			'local:chainer1',
			'local:chainer3'
		];
		return run({
			task: 'chainer',
			target: 'custom',
			environment: 'goodbye',
		})
			.then(function(returnValue) {
				expect(spy).to.have.callCount(3);
				expect(spy).to.have.been.calledWith(expectedConfig[0]);
				expect(spy).to.have.been.calledWith(expectedConfig[1]);
				expect(spy).to.have.been.calledWith(expectedConfig[2]);

				var expected = expectedResults;
				var actual = returnValue;
				expect(actual).to.eql(expected);
			});
	});

	it('should run external tasks with default target config', function() {
		var expectedTask = require('/node_modules/skivvy-package-my-package/tasks/external');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'external - Hello, world!'
		};
		return run({
			task: 'external',
			package: 'my-package'
		})
			.then(function() {
				expect(spy).to.have.been.calledWith(expectedConfig);
			});
	});

	it('should expand default environment placeholders in external task config', function() {
		var expectedTask = require('/node_modules/skivvy-package-my-package/tasks/expander');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'external:expander:default - Hello, world!'
		};
		return run({
			task: 'expander',
			package: 'my-package'
		})
			.then(function() {
				expect(spy).to.have.been.calledWith(expectedConfig);
			});
	});

	it('should expand custom environment placeholders in external task config', function() {
		var expectedTask = require('/node_modules/skivvy-package-my-package/tasks/expander');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'external:expander:default - Goodbye, world!'
		};
		return run({
			task: 'expander',
			environment: 'goodbye',
			package: 'my-package'
		})
			.then(function() {
				expect(spy).to.have.been.calledWith(expectedConfig);
			});
	});

	it('should run external tasks with custom target config', function() {
		var expectedTask = require('/node_modules/skivvy-package-my-package/tasks/expander');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'external:expander:alternate - Goodbye, world!'
		};
		return run({
			task: 'expander',
			target: 'alternate',
			environment: 'goodbye',
			package: 'my-package'
		})
			.then(function() {
				expect(spy).to.have.been.calledWith(expectedConfig);
			});
	});

	it('should run external tasks with overridden config', function() {
		var expectedTask = require('/node_modules/skivvy-package-my-package/tasks/expander');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'external:expander:default - Goodbye, world!',
			override: true
		};
		return run({
			task: 'expander',
			package: 'my-package',
			environment: 'goodbye',
			config: {
				override: true
			}
		})
			.then(function() {
				expect(spy).to.have.been.calledWith(expectedConfig);
			});
	});

	it('should run external tasks with overridden custom environment config', function() {
		var expectedTask = require('/node_modules/skivvy-package-my-package/tasks/expander');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'external:expander:default - Goodbye, world!',
			override: true
		};
		return run({
			task: 'expander',
			package: 'my-package',
			environment: 'goodbye',
			config: {
				override: true
			}
		})
			.then(function() {
				expect(spy).to.have.been.calledWith(expectedConfig);
			});
	});

	it('should run external tasks with named default target', function() {
		var expectedTask = require('/node_modules/skivvy-package-my-package/tasks/defaulter');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'external:defaulter:alternate - Goodbye, world!',
			override: true
		};
		var expectedResults = 'external:defaulter';
		return run({
			task: 'defaulter',
			package: 'my-package',
			environment: 'goodbye',
			config: {
				override: true
			}
		})
			.then(function(returnValue) {
				expect(spy).to.have.been.calledWith(expectedConfig);

				var expected = expectedResults;
				var actual = returnValue;
				expect(actual).to.eql(expected);
			});
	});

	it('should run external tasks with named custom target', function() {
		var expectedTask = require('/node_modules/skivvy-package-my-package/tasks/defaulter');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'external:defaulter:customalternate - Goodbye, world!',
			override: true
		};
		var expectedResults = 'external:defaulter';
		return run({
			task: 'defaulter',
			target: 'custom',
			package: 'my-package',
			environment: 'goodbye',
			config: {
				override: true
			}
		})
			.then(function(returnValue) {
				expect(spy).to.have.been.calledWith(expectedConfig);

				var expected = expectedResults;
				var actual = returnValue;
				expect(actual).to.eql(expected);
			});
	});

	it('should run external tasks with multiple default targets', function() {
		var expectedTask = require('/node_modules/skivvy-package-my-package/tasks/chainer');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = [
			{
				message: 'external:chainer:step0 - Goodbye, world!',
				index: 0,
				override: true
			},
			{
				message: 'external:chainer:step1 - Goodbye, world!',
				index: 1,
				override: true
			},
			{
				message: 'external:chainer:step3 - Goodbye, world!',
				index: 3,
				override: true
			}
		];
		var expectedResults = [
			'external:chainer0',
			'external:chainer1',
			'external:chainer3'
		];
		return run({
			task: 'chainer',
			package: 'my-package',
			environment: 'goodbye',
			config: {
				override: true
			}
		})
			.then(function(returnValue) {
				expect(spy).to.have.callCount(3);
				expect(spy).to.have.been.calledWith(expectedConfig[0]);
				expect(spy).to.have.been.calledWith(expectedConfig[1]);
				expect(spy).to.have.been.calledWith(expectedConfig[2]);

				var expected = expectedResults;
				var actual = returnValue;
				expect(actual).to.eql(expected);
			});
	});

	it('should run external tasks with multiple custom targets', function() {
		var expectedTask = require('/node_modules/skivvy-package-my-package/tasks/chainer');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = [
			{
				message: 'external:chainer:customstep0 - Goodbye, world!',
				index: 0,
				override: true
			},
			{
				message: 'external:chainer:customstep1 - Goodbye, world!',
				index: 1,
				override: true
			},
			{
				message: 'external:chainer:customstep3 - Goodbye, world!',
				index: 3,
				override: true
			}
		];
		var expectedResults = [
			'external:chainer0',
			'external:chainer1',
			'external:chainer3'
		];
		return run({
			task: 'chainer',
			target: 'custom',
			package: 'my-package',
			environment: 'goodbye',
			config: {
				override: true
			}
		})
			.then(function(returnValue) {
				expect(spy).to.have.callCount(3);
				expect(spy).to.have.been.calledWith(expectedConfig[0]);
				expect(spy).to.have.been.calledWith(expectedConfig[1]);
				expect(spy).to.have.been.calledWith(expectedConfig[2]);

				var expected = expectedResults;
				var actual = returnValue;
				expect(actual).to.eql(expected);
			});
	});



	it('should run scoped tasks with default target config', function() {
		var expectedTask = require('/node_modules/@my-packages/skivvy-package-my-package/tasks/scoped');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'scoped - Hello, world!'
		};
		return run({
			task: 'scoped',
			package: '@my-packages/my-package'
		})
			.then(function() {
				expect(spy).to.have.been.calledWith(expectedConfig);
			});
	});

	it('should expand default environment placeholders in scoped task config', function() {
		var expectedTask = require('/node_modules/@my-packages/skivvy-package-my-package/tasks/expander');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'scoped:expander:default - Hello, world!'
		};
		return run({
			task: 'expander',
			package: '@my-packages/my-package'
		})
			.then(function() {
				expect(spy).to.have.been.calledWith(expectedConfig);
			});
	});

	it('should expand custom environment placeholders in scoped task config', function() {
		var expectedTask = require('/node_modules/@my-packages/skivvy-package-my-package/tasks/expander');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'scoped:expander:default - Goodbye, world!'
		};
		return run({
			task: 'expander',
			environment: 'goodbye',
			package: '@my-packages/my-package'
		})
			.then(function() {
				expect(spy).to.have.been.calledWith(expectedConfig);
			});
	});

	it('should run scoped tasks with custom target config', function() {
		var expectedTask = require('/node_modules/@my-packages/skivvy-package-my-package/tasks/expander');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'scoped:expander:alternate - Goodbye, world!'
		};
		return run({
			task: 'expander',
			target: 'alternate',
			environment: 'goodbye',
			package: '@my-packages/my-package'
		})
			.then(function() {
				expect(spy).to.have.been.calledWith(expectedConfig);
			});
	});

	it('should run scoped tasks with overridden config', function() {
		var expectedTask = require('/node_modules/@my-packages/skivvy-package-my-package/tasks/expander');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'scoped:expander:default - Goodbye, world!',
			override: true
		};
		return run({
			task: 'expander',
			package: '@my-packages/my-package',
			environment: 'goodbye',
			config: {
				override: true
			}
		})
			.then(function() {
				expect(spy).to.have.been.calledWith(expectedConfig);
			});
	});

	it('should run scoped tasks with overridden custom environment config', function() {
		var expectedTask = require('/node_modules/@my-packages/skivvy-package-my-package/tasks/expander');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'scoped:expander:default - Goodbye, world!',
			override: true
		};
		return run({
			task: 'expander',
			package: '@my-packages/my-package',
			environment: 'goodbye',
			config: {
				override: true
			}
		})
			.then(function() {
				expect(spy).to.have.been.calledWith(expectedConfig);
			});
	});

	it('should run scoped tasks with named default target', function() {
		var expectedTask = require('/node_modules/@my-packages/skivvy-package-my-package/tasks/defaulter');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'scoped:defaulter:alternate - Goodbye, world!',
			override: true
		};
		var expectedResults = 'scoped:defaulter';
		return run({
			task: 'defaulter',
			package: '@my-packages/my-package',
			environment: 'goodbye',
			config: {
				override: true
			}
		})
			.then(function(returnValue) {
				expect(spy).to.have.been.calledWith(expectedConfig);

				var expected = expectedResults;
				var actual = returnValue;
				expect(actual).to.eql(expected);
			});
	});

	it('should run scoped tasks with named custom target', function() {
		var expectedTask = require('/node_modules/@my-packages/skivvy-package-my-package/tasks/defaulter');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = {
			message: 'scoped:defaulter:customalternate - Goodbye, world!',
			override: true
		};
		var expectedResults = 'scoped:defaulter';
		return run({
			task: 'defaulter',
			target: 'custom',
			package: '@my-packages/my-package',
			environment: 'goodbye',
			config: {
				override: true
			}
		})
			.then(function(returnValue) {
				expect(spy).to.have.been.calledWith(expectedConfig);

				var expected = expectedResults;
				var actual = returnValue;
				expect(actual).to.eql(expected);
			});
	});

	it('should run scoped tasks with multiple default targets', function() {
		var expectedTask = require('/node_modules/@my-packages/skivvy-package-my-package/tasks/chainer');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = [
			{
				message: 'scoped:chainer:step0 - Goodbye, world!',
				index: 0,
				override: true
			},
			{
				message: 'scoped:chainer:step1 - Goodbye, world!',
				index: 1,
				override: true
			},
			{
				message: 'scoped:chainer:step3 - Goodbye, world!',
				index: 3,
				override: true
			}
		];
		var expectedResults = [
			'scoped:chainer0',
			'scoped:chainer1',
			'scoped:chainer3'
		];
		return run({
			task: 'chainer',
			package: '@my-packages/my-package',
			environment: 'goodbye',
			config: {
				override: true
			}
		})
			.then(function(returnValue) {
				expect(spy).to.have.callCount(3);
				expect(spy).to.have.been.calledWith(expectedConfig[0]);
				expect(spy).to.have.been.calledWith(expectedConfig[1]);
				expect(spy).to.have.been.calledWith(expectedConfig[2]);

				var expected = expectedResults;
				var actual = returnValue;
				expect(actual).to.eql(expected);
			});
	});

	it('should run scoped tasks with multiple custom targets', function() {
		var expectedTask = require('/node_modules/@my-packages/skivvy-package-my-package/tasks/chainer');
		var spy = sinon.spy();
		expectedTask.callback = spy;
		var expectedConfig = [
			{
				message: 'scoped:chainer:customstep0 - Goodbye, world!',
				index: 0,
				override: true
			},
			{
				message: 'scoped:chainer:customstep1 - Goodbye, world!',
				index: 1,
				override: true
			},
			{
				message: 'scoped:chainer:customstep3 - Goodbye, world!',
				index: 3,
				override: true
			}
		];
		var expectedResults = [
			'scoped:chainer0',
			'scoped:chainer1',
			'scoped:chainer3'
		];
		return run({
			task: 'chainer',
			target: 'custom',
			package: '@my-packages/my-package',
			environment: 'goodbye',
			config: {
				override: true
			}
		})
			.then(function(returnValue) {
				expect(spy).to.have.callCount(3);
				expect(spy).to.have.been.calledWith(expectedConfig[0]);
				expect(spy).to.have.been.calledWith(expectedConfig[1]);
				expect(spy).to.have.been.calledWith(expectedConfig[2]);

				var expected = expectedResults;
				var actual = returnValue;
				expect(actual).to.eql(expected);
			});
	});

	it('should run function tasks with the provided config', function() {
		var config = { user: 'world' };
		var task = sinon.spy(function(config) {});

		var actual, expected;
		expected = config;
		actual = run({
			task: task,
			config: config
		});
		return actual.then(function() {
			expect(task).to.have.been.calledWith(expected);
		});
	});

	it('should run { function, config } tasks with their own config', function() {
		var config = { message: 'hello', user: 'world' };
		var taskConfig = { message: 'goodbye' };
		var task = {
			task: sinon.spy(function(config) {}),
			config: taskConfig
		};
		var expectedTask = task.task;
		var expectedConfig = task.config;
		return run({
			task: task,
			config: config
		}).then(function() {
			expect(expectedTask).to.have.been.calledWith(expectedConfig);
		});
	});

	it('should resolve with a value for synchronous tasks', function() {
		var config = { user: 'world' };
		var output = 'Hello, world!';
		var task = function(config) {
			return output;
		};

		var actual, expected;
		expected = output;
		actual = run({
			task: task,
			config: config
		});
		return expect(actual).to.eventually.equal(expected);
	});

	it('should reject with an error for synchronous tasks', function() {
		var config = { user: 'world' };
		var output = new Error('Goodbye, world!');
		var task = function(config) {
			throw output;
		};

		var actual, expected;
		expected = output;
		actual = run({
			task: task,
			config: config
		});
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should handle asynchronous tasks by returning a promise (success)', function() {
		var config = { user: 'world' };
		var output = 'Hello, world!';
		var task = sinon.spy(function(config) {
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					resolve(output);
				});
			});
		});

		var actual, expected;
		expected = output;
		actual = run({
			task: task,
			config: config
		});
		return Promise.all([
			actual.then(function() {
				expect(task).to.have.been.calledWith(config);
			}),
			expect(actual).to.eventually.equal(expected)
		]);
	});

	it('should handle asynchronous tasks by returning a promise (failure)', function() {
		var config = { user: 'world' };
		var output = new Error('Goodbye, world!');
		var task = function(config) {
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					reject(output);
				});
			});
		};

		var actual, expected;
		expected = Error;
		actual = run({
			task: task,
			config: config
		});
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should handle asynchronous functions by returning a stream (success)', function() {
		var config = {
			chunks: ['hello', 'world']
		};
		var dataSpy = sinon.spy();
		var completedSpy = sinon.spy();
		var task = sinon.spy(function(config) {
			var chunks = config.chunks.slice();
			var stream = new Stream.Readable({ objectMode: true, highWaterMark: 1 });
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
		});

		var actual, expected;
		expected = undefined;
		actual = run({
			task: task,
			config: config
		});
		return expect(actual).to.eventually.equal(expected)
			.then(function(returnValue) {
				expect(dataSpy).to.have.callCount(config.chunks.length);
				expect(completedSpy).to.have.been.calledOnce;

				actual = returnValue;
				expected = undefined;
				expect(actual).to.equal(expected);
			});
	});

	it('should handle asynchronous functions by returning a stream (failure)', function() {
		var config = {
			chunks: ['hello', 'world']
		};
		var dataSpy = sinon.spy();
		var completedSpy = sinon.spy();
		var task = sinon.spy(function(config) {
			var chunks = config.chunks.slice();
			var stream = new Stream.Readable({ objectMode: true, highWaterMark: 1 });
			stream._read = function() {
				if (chunks.length === 0) {
					completedSpy();
					this.emit('error', new Error('Goodbye, world!'));
				} else {
					dataSpy();
					this.push(chunks.shift());
				}
			};
			return stream;
		});

		var actual, expected;
		expected = 'Goodbye, world!';
		actual = run({
			task: task,
			config: config
		});
		return expect(actual).to.be.rejectedWith(expected)
			.then(function(returnValue) {
				expect(dataSpy).to.have.callCount(config.chunks.length);
				expect(completedSpy).to.have.been.calledOnce;

				actual = returnValue;
				expected = undefined;
				expect(actual).to.equal(expected);
			});
	});

	it('should handle asynchronous tasks by providing a callback (success)', function() {
		var config = { user: 'world' };
		var output = 'Hello, world!';
		var task = sinon.spy(function(config, callback) {
			setTimeout(function() {
				callback(null, output);
			});
		});

		var actual, expected;
		expected = output;
		actual = run({
			task: task,
			config: config
		});
		return Promise.all([
			actual.then(function() {
				expect(task).to.have.been.calledWith(config);
			}),
			expect(actual).to.eventually.equal(expected)
		]);
	});

	it('should handle asynchronous tasks by providing a callback (void)', function() {
		var config = { user: 'world' };
		var task = sinon.spy(function(config, callback) {
			setTimeout(function() {
				callback();
			});
		});

		var actual, expected;
		expected = undefined;
		actual = run({
			task: task,
			config: config
		});
		return Promise.all([
			actual.then(function() {
				expect(task).to.have.been.calledWith(config);
			}),
			expect(actual).to.eventually.equal(expected)
		]);
	});

	it('should handle asynchronous tasks by providing a callback (failure)', function() {
		var config = { user: 'world' };
		var output = new Error('Goodbye, world!');
		var task = function(config, callback) {
			setTimeout(function() {
				callback(output);
			});
		};

		var actual, expected;
		expected = output;
		actual = run({
			task: task,
			config: config
		});
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should handle asynchronous tasks by providing this.async() (success)', function() {
		var config = { user: 'world' };
		var task = sinon.spy(function(config) {
			var done = this.async();
			setTimeout(function() {
				done();
			});
		});

		var actual, expected;
		expected = undefined;
		actual = run({
			task: task,
			config: config
		});
		return Promise.all([
			actual.then(function() {
				expect(task).to.have.been.calledWith(config);
			}),
			expect(actual).to.eventually.equal(expected)
		]);
	});

	it('should handle asynchronous tasks by providing this.async() (failure)', function() {
		var config = { user: 'world' };
		var task = function(config) {
			var done = this.async();
			setTimeout(function() {
				done(false);
			});
		};

		var actual, expected;
		expected = Error;
		actual = run({
			task: task,
			config: config
		});
		return expect(actual).to.be.rejectedWith(expected);
	});

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

		var expected = ['task1', 'task2', 'task3'];
		return run({
			task: [task1, task2, task3],
			config: {
				user: 'world'
			}
		})
			.then(function(actual) {
				var expectedConfig = {
					user: 'world'
				};
				expect(task1).to.have.been.calledOnce;
				expect(task2).to.have.been.calledOnce;
				expect(task3).to.have.been.calledOnce;
				expect(task1).to.have.been.calledWith(expectedConfig);
				expect(task2).to.have.been.calledWith(expectedConfig);
				expect(task3).to.have.been.calledWith(expectedConfig);
				expect(actual).to.eql(expected);
			});
	});

	it('should run an array of named tasks in series', function() {
		var localTask = require('/skivvy_tasks/series.js');
		var localSpy = sinon.spy();
		localTask.callback = localSpy;

		var externalTask = require('/node_modules/skivvy-package-my-package/tasks/series.js');
		var externalSpy = sinon.spy();
		externalTask.callback = externalSpy;

		var scopedTask = require('/node_modules/@my-packages/skivvy-package-my-package/tasks/series.js');
		var scopedSpy = sinon.spy();
		scopedTask.callback = scopedSpy;

		var expected = ['local:series', 'external:series', 'scoped:series'];
		return run({
			task: [
				'series',
				{ task: 'series', package: 'my-package' },
				{ task: 'series', package: '@my-packages/my-package' }
			]
		})
			.then(function(actual) {
				var expectedLocalConfig = {
					message: 'series - Hello, world!'
				};
				var expectedExternalConfig = {
					message: 'external:series - Hello, world!'
				};
				var expectedScopedConfig = {
					message: 'scoped:series - Hello, world!'
				};
				expect(localSpy).to.have.been.calledOnce;
				expect(externalSpy).to.have.been.calledOnce;
				expect(scopedSpy).to.have.been.calledOnce;
				expect(localSpy).to.have.been.calledWith(expectedLocalConfig);
				expect(externalSpy).to.have.been.calledWith(expectedExternalConfig);
				expect(scopedSpy).to.have.been.calledWith(expectedScopedConfig);
				expect(actual).to.eql(expected);
			});
	});

	it('should pass config overrides through to local array subtasks', function() {
		var expectedLocalConfig = {
			message: 'series - Hello, world!',
			override: true
		};
		var expectedExternalConfig = {
			message: 'external:series - Hello, world!'
		};
		var expectedScopedConfig = {
			message: 'scoped:series - Hello, world!'
		};

		var localTask = require('/skivvy_tasks/series.js');
		var localSpy = sinon.spy();
		localTask.callback = localSpy;

		var externalTask = require('/node_modules/skivvy-package-my-package/tasks/series.js');
		var externalSpy = sinon.spy();
		externalTask.callback = externalSpy;

		var scopedTask = require('/node_modules/@my-packages/skivvy-package-my-package/tasks/series.js');
		var scopedSpy = sinon.spy();
		scopedTask.callback = scopedSpy;

		var expected = ['local:series', 'external:series', 'scoped:series'];
		return run({
			task: [
				'series',
				{ task: 'series', package: 'my-package' },
				{ task: 'series', package: '@my-packages/my-package' }
			],
			config: {
				override: true
			}
		})
			.then(function(actual) {
				expect(localSpy).to.have.been.calledOnce;
				expect(externalSpy).to.have.been.calledOnce;
				expect(scopedSpy).to.have.been.calledOnce;
				expect(localSpy).to.have.been.calledWith(expectedLocalConfig);
				expect(externalSpy).to.have.been.calledWith(expectedExternalConfig);
				expect(scopedSpy).to.have.been.calledWith(expectedScopedConfig);
				expect(actual).to.eql(expected);
			});
	});

	it('should pass environment setting through to array subtasks', function() {
		var expectedLocalConfig = {
			message: 'series - Goodbye, world!',
			override: true
		};
		var expectedExternalConfig = {
			message: 'external:series - Goodbye, world!'
		};
		var expectedScopedConfig = {
			message: 'scoped:series - Goodbye, world!'
		};

		var localTask = require('/skivvy_tasks/series.js');
		var localSpy = sinon.spy();
		localTask.callback = localSpy;

		var externalTask = require('/node_modules/skivvy-package-my-package/tasks/series.js');
		var externalSpy = sinon.spy();
		externalTask.callback = externalSpy;

		var scopedTask = require('/node_modules/@my-packages/skivvy-package-my-package/tasks/series.js');
		var scopedSpy = sinon.spy();
		scopedTask.callback = scopedSpy;

		var expected = ['local:series', 'external:series', 'scoped:series'];
		return run({
			task: [
				'series',
				{ task: 'series', package: 'my-package' },
				{ task: 'series', package: '@my-packages/my-package' }
			],
			environment: 'goodbye',
			config: {
				override: true
			}
		})
			.then(function(actual) {
				expect(localSpy).to.have.been.calledOnce;
				expect(externalSpy).to.have.been.calledOnce;
				expect(scopedSpy).to.have.been.calledOnce;
				expect(localSpy).to.have.been.calledWith(expectedLocalConfig);
				expect(externalSpy).to.have.been.calledWith(expectedExternalConfig);
				expect(scopedSpy).to.have.been.calledWith(expectedScopedConfig);
				expect(actual).to.eql(expected);
			});
	});

	it('should dispatch task start and end events', function() {
		var expectedConfig = { user: 'world' };
		var actualConfig = { user: 'world' };
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

		var expected, actual;
		expected = [
			{
				event: events.TASK_STARTED,
				task: compositeTask,
				config: expectedConfig
			},
			{
				event: events.TASK_STARTED,
				task: task1,
				config: expectedConfig
			},
			{
				event: events.TASK_COMPLETED,
				result: 'task1',
				task: task1,
				config: expectedConfig
			},
			{
				event: events.TASK_STARTED,
				task: task2,
				config: expectedConfig
			},
			{
				event: events.TASK_COMPLETED,
				result: 'task2',
				task: task2,
				config: expectedConfig
			},
			{
				event: events.TASK_STARTED,
				task: task3,
				config: expectedConfig
			},
			{
				event: events.TASK_COMPLETED,
				result: 'task3',
				task: task3,
				config: expectedConfig
			},
			{
				event: events.TASK_COMPLETED,
				result: ['task1', 'task2', 'task3'],
				task: compositeTask,
				config: expectedConfig
			}
		];
		actual = [];

		api.on(events.TASK_STARTED, onStarted);
		api.on(events.TASK_COMPLETED, onCompleted);
		api.on(events.TASK_FAILED, onFailed);


		function onStarted(data) {
			actual.push({
				event: events.TASK_STARTED,
				task: data.task,
				config: data.config
			});
		}

		function onCompleted(data) {
			actual.push({
				event: events.TASK_COMPLETED,
				result: data.result,
				task: data.task,
				config: data.config
			});
		}

		function onFailed(data) {
			actual.push({
				event: events.TASK_FAILED,
				error: data.error,
				task: data.task,
				config: data.config
			});
		}

		return run({
			task: compositeTask,
			config: actualConfig
		})
			.then(function() {
				return expect(actual).to.eql(expected);
			})
			.finally(function() {
				api.removeListener(events.TASK_STARTED, onStarted);
				api.removeListener(events.TASK_COMPLETED, onCompleted);
				api.removeListener(events.TASK_FAILED, onFailed);
			});
	});

	it('should allow custom project paths', function() {
		var expected = ['local', 'external', 'scoped'];
		return run({
			task: [
				'custom',
				{ package: 'my-package', task: 'custom' },
				{ package: '@my-packages/my-package', task: 'custom' }
			],
			path: '/project'
		})
			.then(function(actual) {
				expect(actual).to.eql(expected);
			});
	});

	it('should maintain current working directory with custom project path', function() {
		var task = function(config) {
			return process.cwd();
		};
		var expected = '/';
		return run({
			task: task,
			path: '/project'
		})
			.then(function(actual) {
				expect(actual).to.equal(expected);
			});
	});

	it('should allow custom working directory', function() {
		var task = function(config) {
			return process.cwd();
		};
		var expected = '/other';
		return run({
			task: task,
			cwd: '/other'
		})
			.then(function(actual) {
				expect(actual).to.equal(expected);
			});
	});

	it('should allow custom working directory with custom project path', function() {
		var task = function(config) {
			return process.cwd();
		};
		var expected = '/other';
		return run({
			task: task,
			path: '/project',
			cwd: '/other'
		})
			.then(function(actual) {
				expect(actual).to.equal(expected);
			});
	});
});
