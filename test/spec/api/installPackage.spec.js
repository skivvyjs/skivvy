'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
var fs = require('fs');
var Promise = require('promise');
var rewire = require('rewire');

var mockFiles = require('../../utils/mock-files');
var mockNpmCommandsFactory = require('../../fixtures/mockNpmCommandsFactory');

var api = require('../../../lib/api');
var events = require('../../../lib/events');

var InvalidPackageError = require('../../../lib/errors').InvalidPackageError;

var sharedTests = require('../sharedTests');
var installPackage = rewire('../../../lib/api/installPackage');

chai.use(chaiAsPromised);
chai.use(sinonChai);

sharedTests.addAsyncProjectTests(installPackage, 'api.installPackage()');

describe('api.installPackage()', function() {
	var npmCommands = mockNpmCommandsFactory();
	var resetNpmCommands;
	var unmockFiles;

	before(function() {
		resetNpmCommands = installPackage.__set__('npmCommands', npmCommands);
	});

	after(function() {
		resetNpmCommands();
	});

	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
	});

	it('should throw an error if no package is specified', function() {
		var pkg = {
			name: 'my-package'
		};
		var config = {
			environment: {
				default: {}
			},
			packages: {},
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidPackageError;
		actual = [
			installPackage({ path: '/project' }),
			installPackage({ path: '/project', package: undefined }),
			installPackage({ path: '/project', package: null }),
			installPackage({ path: '/project', package: false }),
			installPackage({ path: '/project', package: '' })
		];
		return Promise.all(actual.map(function(actual) {
			return expect(actual).to.be.rejectedWith(expected);
		}));
	});

	it('should run npm install [package] in the specified directory', function() {
		var pkg = {
			name: 'my-package'
		};
		var config = {
			environment: {
				default: {}
			},
			packages: {},
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		return installPackage({
			package: 'goodbye-world',
			path: '/project'
		})
			.then(function(returnValue) {
				expected = '1.2.3';
				actual = returnValue;
				expect(actual).to.equal(expected);

				var npmOptions = {
					'save-dev': true
				};
				expect(npmCommands.install).to.have.been.calledWith('skivvy-package-goodbye-world', npmOptions, '/project');
			});
	});

	it('should add a package namespace to the config file if none exists', function() {
		var pkg = {
			name: 'my-package'
		};
		var config = {
			environment: {
				default: {}
			},
			packages: {},
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		return installPackage({
			package: 'goodbye-world',
			path: '/project'
		})
			.then(function(returnValue) {
				expected = {
					environment: {
						default: {}
					},
					packages: {
						'goodbye-world': {
							config: {},
							tasks: {}
						}
					}
				};
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expect(actual).to.eql(expected);
			});
	});

	it('should add a packages section to the config file if none exists', function() {
		var pkg = {
			name: 'my-package'
		};
		var config = {
			environment: {
				default: {}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		return installPackage({
			package: 'goodbye-world',
			path: '/project'
		})
			.then(function(returnValue) {
				expected = {
					environment: {
						default: {}
					},
					packages: {
						'goodbye-world': {
							config: {},
							tasks: {}
						}
					}
				};
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expect(actual).to.eql(expected);
			});
	});

	it('should not modify the config file if the package namespace already exists', function() {
		var pkg = {
			name: 'my-package'
		};
		var config = {
			environment: {
				default: {}
			},
			packages: {
				'goodbye-world': {
					config: {
						message: 'Goodbye, world!'
					},
					tasks: {}
				}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		return installPackage({
			package: 'goodbye-world',
			path: '/project'
		})
			.then(function(returnValue) {
				expected = config;
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expect(actual).to.eql(expected);
			});
	});

	it('should not conflict with existing modules', function() {
		var pkg = {
			name: 'my-package'
		};
		var config = {
			environment: {
				default: {}
			},
			packages: {
				'hello-world': {
					config: {
						message: 'Hello, world!'
					},
					tasks: {}
				}
			},
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/skivvy-package-hello-world/package.json': '{ "name": "skivvy-package-hello-world", "version": "1.2.3" }',
			'/project/node_modules/skivvy-package-hello-world/index.js': 'exports.tasks = {}; exports.description = \'Hello World package\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		return installPackage({
			package: 'goodbye-world',
			path: '/project'
		})
			.then(function(returnValue) {
				expected = '1.2.3';
				actual = returnValue;
				expect(actual).to.equal(expected);

				var npmOptions = {
					'save-dev': true
				};
				expect(npmCommands.install).to.have.been.calledWith('skivvy-package-goodbye-world', npmOptions, '/project');

				expected = {
					environment: {
						default: {}
					},
					packages: {
						'hello-world': {
							config: {
								message: 'Hello, world!'
							},
							tasks: {}
						},
						'goodbye-world': {
							config: {},
							tasks: {}
						}
					}
				};
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expect(actual).to.eql(expected);
			});
	});

	it('should handle scoped packages correctly', function() {
		var pkg = {
			name: 'my-package'
		};
		var config = {
			environment: {
				default: {}
			},
			packages: {
				'hello-world': {
					config: {
						message: 'Hello, world!'
					},
					tasks: {}
				}
			},
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/skivvy-package-hello-world/package.json': '{ "name": "skivvy-package-hello-world", "version": "1.2.3" }',
			'/project/node_modules/skivvy-package-hello-world/index.js': 'exports.tasks = {}; exports.description = \'Hello World package\';'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		return installPackage({
			package: '@my-packages/goodbye-world',
			path: '/project'
		})
			.then(function(returnValue) {
				expected = '1.2.3';
				actual = returnValue;
				expect(actual).to.equal(expected);

				var npmOptions = {
					'save-dev': true
				};
				expect(npmCommands.install).to.have.been.calledWith('@my-packages/skivvy-package-goodbye-world', npmOptions, '/project');

				expected = {
					environment: {
						default: {}
					},
					packages: {
						'hello-world': {
							config: {
								message: 'Hello, world!'
							},
							tasks: {}
						},
						'@my-packages/goodbye-world': {
							config: {},
							tasks: {}
						}
					}
				};
				actual = JSON.parse(fs.readFileSync('/project/.skivvyrc', 'utf8'));
				expect(actual).to.eql(expected);
			});
	});

	it('should default to process.cwd() if no path is specified', function() {
		var pkg = {
			name: 'my-package'
		};
		var config = {
			environment: {
				default: {}
			},
			packages: {}
		};
		var files = {
			'/package.json': JSON.stringify(pkg),
			'/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		return installPackage({
			package: 'goodbye-world'
		})
			.then(function(returnValue) {
				expected = '1.2.3';
				actual = returnValue;
				expect(actual).to.equal(expected);

				var npmOptions = {
					'save-dev': true
				};
				expect(npmCommands.install).to.have.been.calledWith('skivvy-package-goodbye-world', npmOptions, '/');
			});
	});

	it('should have tests for events', function() {
		var pkg = {
			name: 'my-package'
		};
		var config = {
			environment: {
				default: {}
			},
			packages: {},
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = [
			{
				event: events.INSTALL_PACKAGE_STARTED,
				package: 'goodbye-world',
				path: '/project'
			},
			{
				event: events.INSTALL_PACKAGE_COMPLETED,
				version: '1.2.3',
				package: 'goodbye-world',
				path: '/project'
			}
		];
		actual = [];

		api.on(events.INSTALL_PACKAGE_STARTED, onStarted);
		api.on(events.INSTALL_PACKAGE_COMPLETED, onCompleted);
		api.on(events.INSTALL_PACKAGE_FAILED, onFailed);


		function onStarted(data) {
			actual.push({
				event: events.INSTALL_PACKAGE_STARTED,
				package: data.package,
				path: data.path
			});
		}

		function onCompleted(data) {
			actual.push({
				event: events.INSTALL_PACKAGE_COMPLETED,
				version: data.version,
				package: data.package,
				path: data.path
			});
		}

		function onFailed(data) {
			actual.push({
				event: events.INSTALL_PACKAGE_FAILED,
				error: data.error,
				package: data.package,
				path: data.path
			});
		}

		return installPackage({
			package: 'goodbye-world',
			path: '/project'
		})
			.then(function() {
				return expect(actual).to.eql(expected);
			})
			.finally(function() {
				api.removeListener(events.INSTALL_PACKAGE_STARTED, onStarted);
				api.removeListener(events.INSTALL_PACKAGE_COMPLETED, onCompleted);
				api.removeListener(events.INSTALL_PACKAGE_FAILED, onFailed);
			});
	});
});
