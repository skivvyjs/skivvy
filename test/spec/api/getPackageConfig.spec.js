'use strict';

var chai = require('chai');
var expect = chai.expect;

var mockFiles = require('../../utils/mock-files');
var sharedTests = require('../sharedTests');

var InvalidPackageError = require('../../../lib/errors').InvalidPackageError;

var getPackageConfig = require('../../../lib/api/getPackageConfig');

sharedTests.addSyncProjectTests(getPackageConfig, 'api.getPackageConfig()');

describe('api.getPackageConfig()', function() {
	var unmockFiles = null;
	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
	});

	it('should throw an error if no package name was specified', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = InvalidPackageError;
		actual = [
			function() { return getPackageConfig({ path: '/project' }); },
			function() { return getPackageConfig({ package: undefined, path: '/project' }); },
			function() { return getPackageConfig({ package: null, path: '/project' }); },
			function() { return getPackageConfig({ package: false, path: '/project' }); },
			function() { return getPackageConfig({ package: '', path: '/project' }); }
		];
		actual.forEach(function(actual) {
			expect(actual).to.throw(expected);
		});
	});

	it('should return the package config', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {
				'hello': {
					config: {
						user: 'world'
					}
				}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			user: 'world'
		};
		actual = getPackageConfig({ package: 'hello', path: '/project' });
		expect(actual).to.eql(expected);
	});

	it('should return an empty object if package config is undefined', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {};
		actual = getPackageConfig({ package: 'hello', path: '/project' });
		expect(actual).to.eql(expected);
	});

	it('should return a copy of default package config if config contains no package config', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {}; exports.defaults = { user: \'world\' }'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			user: 'world'
		};
		actual = getPackageConfig({ package: 'hello', path: '/project' });
		expect(actual).to.eql(expected);

		expected = require('/project/node_modules/@skivvy/skivvy-package-hello').defaults;
		expect(actual).to.eql(expected);
		expect(actual).not.to.equal(expected);
	});

	it('should return an empty object if config contains no package config and no default package config exists', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {};
		actual = getPackageConfig({ package: 'hello', path: '/project' });
		expect(actual).to.eql(expected);
	});

	it('should extend default package config with package config', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {
				'hello': {
					config: {
						greeting: 'Goodbye'
					}
				}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {}; exports.defaults = { user: \'world\' }'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			greeting: 'Goodbye',
			user: 'world'
		};
		actual = getPackageConfig({ package: 'hello', path: '/project' });
		expect(actual).to.eql(expected);
	});

	it('should expand placeholders in config', function() {
		var pkg = {
			author: 'A User <user@example.com>',
			version: '1.0.1'
		};
		var config = {
			environment: {
				default: {
					user: 'Mr <%= project.author %>',
					message: 'Hello, <%= project.author %>!'
				}
			},
			packages: {
				'hello': {
					config: {
						welcome: 'Welcome, <%= environment.user %>!'
					}
				}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {}; exports.defaults = { \'version\': \'v<%= project.version %>\' }'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			welcome: 'Welcome, Mr A User <user@example.com>!',
			version: 'v1.0.1'
		};
		actual = getPackageConfig({ package: 'hello', path: '/project', expand: true });
		expect(actual).to.eql(expected);
	});

	it('should skip expanding placeholders in config', function() {
		var pkg = {
			author: 'A User <user@example.com>',
			version: '1.0.1'
		};
		var config = {
			environment: {
				default: {
					user: 'Mr <%= project.author %>',
					message: 'Hello, <%= project.author %>!'
				}
			},
			packages: {
				'hello': {
					config: {
						welcome: 'Welcome, <%= environment.user %>!'
					}
				}
			}
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/.skivvyrc': JSON.stringify(config),
			'/project/node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {}; exports.defaults = { \'version\': \'v<%= project.version %>\' }'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			welcome: 'Welcome, <%= environment.user %>!',
			version: 'v<%= project.version %>'
		};
		actual = [
			getPackageConfig({ package: 'hello', path: '/project' }),
			getPackageConfig({ package: 'hello', path: '/project', expand: undefined }),
			getPackageConfig({ package: 'hello', path: '/project', expand: null }),
			getPackageConfig({ package: 'hello', path: '/project', expand: false }),
			getPackageConfig({ package: 'hello', path: '/project', expand: '' })
		];
		actual.forEach(function(actual) {
			expect(actual).to.eql(expected);
		});
	});

	it('should default to process.cwd() if no path is specified', function() {
		var pkg = {};
		var config = {
			environment: {
				default: {}
			},
			packages: {
				'hello': {
					config: {
						user: 'world'
					}
				}
			}
		};
		var files = {
			'package.json': JSON.stringify(pkg),
			'.skivvyrc': JSON.stringify(config),
			'node_modules/@skivvy/skivvy-package-hello/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var expected, actual;
		expected = {
			user: 'world'
		};
		actual = [
			getPackageConfig({ package: 'hello' }),
			getPackageConfig({ package: 'hello', path: undefined }),
			getPackageConfig({ package: 'hello', path: null }),
			getPackageConfig({ package: 'hello', path: false }),
			getPackageConfig({ package: 'hello', path: '' })
		];
		actual.forEach(function(actual) {
			expect(actual).to.eql(expected);
		});
	});
});
