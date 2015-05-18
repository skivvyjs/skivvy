'use strict';

var chai = require('chai');
var expect = chai.expect;
var sinonChai = require('sinon-chai');
var rewire = require('rewire');

var mockFiles = require('../../utils/mock-files');

var events = require('../../../lib/events');

var mockApiFactory = require('../../fixtures/mockApiFactory');
var mockInitPackageJsonFactory = require('../../fixtures/mockInitPackageJsonFactory');
var mockNpmCommandsFactory = require('../../fixtures/mockNpmCommandsFactory');
var cliInit = rewire('../../../lib/cli/init');


chai.use(sinonChai);

describe('cli.init()', function() {
	var api = mockApiFactory();
	var initPackageJson = mockInitPackageJsonFactory(function(error, data) {
		if (initPackageJsonCallback) { initPackageJsonCallback(error, data); }
	});
	var npmCommands = mockNpmCommandsFactory();
	var resetApi;
	var resetInitPackageJson;
	var initPackageJsonCallback;
	var resetNpmCommands;
	var unmockFiles;

	before(function() {
		resetApi = cliInit.__set__('api', api);
		resetInitPackageJson = cliInit.__set__('initPackageJson', initPackageJson);
		resetNpmCommands = cliInit.__set__('npmCommands', npmCommands);
	});

	after(function() {
		resetApi();
		resetInitPackageJson();
		resetNpmCommands();
	});

	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
		if (initPackageJsonCallback) {
			initPackageJsonCallback = null;
		}
		api.reset();
		initPackageJson.reset();
		npmCommands.reset();
	});

	it('should call API method with correct arguments if package.json is present and local npm module is present', function() {
		var pkg = {
			name: 'hello-world'
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg),
			'/project/node_nodules/skivvy/index.js': 'module.exports = {};',
			'/project/node_nodules/skivvy/package.json': '{ "name": "skivvy", "version": "0.0.1" }',
		};
		unmockFiles = mockFiles(files);

		var args = [];
		var options = {
			path: '/project'
		};
		var expected = {
			path: '/project'
		};
		return cliInit(args, options)
			.then(function() {
				expect(api.initProject).to.have.been.calledWith(expected);
				expect(npmCommands.install).not.to.have.been.called;
				expect(api.emit).not.to.have.been.calledWith(events.INIT_PROJECT_NPM_INIT_NEEDED);
				expect(api.emit).not.to.have.been.calledWith(events.INIT_PROJECT_API_INSTALL_NEEDED);
			});
	});

	it('should call API method with correct arguments and install local npm module if package.json is present and local npm module is not present', function() {
		var pkg = {
			name: 'hello-world'
		};
		var files = {
			'/project/package.json': JSON.stringify(pkg)
		};
		unmockFiles = mockFiles(files);

		var args = [];
		var options = {
			path: '/project'
		};
		var expected = {
			path: '/project'
		};
		return cliInit(args, options)
			.then(function() {
				expect(api.initProject).to.have.been.calledWith(expected);

				var npmPackages = ['skivvy'];
				var npmOptions = {
					'save-dev': true
				};
				expect(npmCommands.install).to.have.been.calledWith(npmPackages, npmOptions, '/project');
				expect(api.emit).not.to.have.been.calledWith(events.INIT_PROJECT_NPM_INIT_NEEDED);
				expect(api.emit).to.have.been.calledWith(events.INIT_PROJECT_API_INSTALL_NEEDED);
			});
	});

	it('should run npm init before API method if package.json is not present', function() {
		var files = {};
		unmockFiles = mockFiles(files);

		initPackageJsonCallback = function(error, data) {
			expect(api.initProject).not.to.have.been.called;
		};

		var args = [];
		var options = {
			path: '/project'
		};
		var expected = {
			path: '/project'
		};
		return cliInit(args, options)
			.then(function() {
				expect(initPackageJson).to.have.been.calledWith('/project');
				expect(api.initProject).to.have.been.calledWith(expected);

				var npmPackages = ['skivvy'];
				var npmOptions = {
					'save-dev': true
				};
				expect(npmCommands.install).to.have.been.calledWith(npmPackages, npmOptions, '/project');
				expect(api.emit).to.have.been.calledWith(events.INIT_PROJECT_NPM_INIT_NEEDED);
				expect(api.emit).to.have.been.calledWith(events.INIT_PROJECT_API_INSTALL_NEEDED);
			});
	});

	it('should run npm init before API method if package.json is not present (custom path)', function() {
		var pkg = {
			name: 'hello-world'
		};
		var config = {
			environment: {
				default: {}
			},
			packages: {}
		};
		var files = {
			'project.json': JSON.stringify(pkg),
			'.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		initPackageJsonCallback = function(error, data) {
			expect(api.initProject).not.to.have.been.called;
		};

		var args = [];
		var options = {
			path: '/project'
		};
		var expected = {
			path: '/project'
		};
		return cliInit(args, options)
			.then(function() {
				expect(initPackageJson).to.have.been.calledWith('/project');
				expect(api.initProject).to.have.been.calledWith(expected);

				var npmPackages = ['skivvy'];
				var npmOptions = {
					'save-dev': true
				};
				expect(npmCommands.install).to.have.been.calledWith(npmPackages, npmOptions, '/project');
				expect(api.emit).to.have.been.calledWith(events.INIT_PROJECT_NPM_INIT_NEEDED);
				expect(api.emit).to.have.been.calledWith(events.INIT_PROJECT_API_INSTALL_NEEDED);
			});
	});

	it('should default to process.cwd() if no path is specified', function() {
		var files = {};
		unmockFiles = mockFiles(files);

		initPackageJsonCallback = function(error, data) {
			expect(api.initProject).not.to.have.been.called;
		};

		var args = [];
		var options = {};
		var expected = {
			path: '/'
		};
		return cliInit(args, options)
			.then(function() {
				expect(initPackageJson).to.have.been.calledWith('/');
				expect(api.initProject).to.have.been.calledWith(expected);

				var npmPackages = ['skivvy'];
				var npmOptions = {
					'save-dev': true
				};
				expect(npmCommands.install).to.have.been.calledWith(npmPackages, npmOptions, '/');
				expect(api.emit).to.have.been.calledWith(events.INIT_PROJECT_NPM_INIT_NEEDED);
				expect(api.emit).to.have.been.calledWith(events.INIT_PROJECT_API_INSTALL_NEEDED);
			});
	});
});
