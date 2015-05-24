'use strict';

var chai = require('chai');
var expect = chai.expect;

var mockFiles = require('../utils/mock-files');

var InvalidProjectError = require('../../lib/errors').InvalidProjectError;

describe('api', function() {
	var Api;
	var unmockFiles = null;
	before(function() {
		Api = require('../../lib/api');
	});

	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
	});

	it('should expose the correct static members', function() {
		expect(Api.events).to.eql(require('../../lib/events'));
		expect(Api.errors).to.eql(require('../../lib/errors'));
		expect(Api.constants).to.eql(require('../../lib/constants'));

		expect(Api.utils.log).to.be.a('function');
		expect(Api.utils.log.debug).to.be.a('function');
		expect(Api.utils.log.info).to.be.a('function');
		expect(Api.utils.log.warn).to.be.a('function');
		expect(Api.utils.log.error).to.be.a('function');
		expect(Api.utils.log.success).to.be.a('function');
		expect(Api.utils.colors.path).to.be.a('function');
		expect(Api.utils.colors.package).to.be.a('function');
		expect(Api.utils.colors.task).to.be.a('function');
		expect(Api.utils.colors.time).to.be.a('function');
		expect(Api.utils.timer.start).to.be.a('function');
		expect(Api.utils.timer.end).to.be.a('function');

		expect(Api.addListener).to.be.a('function');
		expect(Api.emit).to.be.a('function');
		expect(Api.listeners).to.be.a('function');
		expect(Api.off).to.be.a('function');
		expect(Api.on).to.be.a('function');
		expect(Api.once).to.be.a('function');
		expect(Api.removeAllListeners).to.be.a('function');
		expect(Api.removeListener).to.be.a('function');
		expect(Api.setMaxListeners).to.be.a('function');
	});

	it('should set the project path', function() {
		var files = {
			'/project/.skivvyrc': '{}'
		};
		unmockFiles = mockFiles(files);

		var api = new Api('/project');
		expect(api.path).to.equal('/project');
	});

	it('should expose the correct instance members', function() {
		var files = {
			'/project/.skivvyrc': '{}'
		};
		unmockFiles = mockFiles(files);

		var api = new Api('/project');

		expect(api.events).to.equal(Api.events);

		expect(Api.utils.log).to.be.a('function');
		expect(Api.utils.log.debug).to.be.a('function');
		expect(Api.utils.log.info).to.be.a('function');
		expect(Api.utils.log.warn).to.be.a('function');
		expect(Api.utils.log.error).to.be.a('function');
		expect(Api.utils.log.success).to.be.a('function');
		expect(Api.utils.colors.path).to.be.a('function');
		expect(Api.utils.colors.package).to.be.a('function');
		expect(Api.utils.colors.task).to.be.a('function');
		expect(Api.utils.colors.time).to.be.a('function');
		expect(Api.utils.timer.start).to.be.a('function');
		expect(Api.utils.timer.end).to.be.a('function');

		expect(api.installPackage).to.be.a('function');
		expect(api.uninstallPackage).to.be.a('function');
		expect(api.updatePackage).to.be.a('function');
		expect(api.listPackages).to.be.a('function');
		expect(api.getEnvironmentConfig).to.be.a('function');
		expect(api.updateEnvironmentConfig).to.be.a('function');
		expect(api.getPackageConfig).to.be.a('function');
		expect(api.updatePackageConfig).to.be.a('function');
		expect(api.run).to.be.a('function');

		expect(api.addListener).to.be.a('function');
		expect(api.emit).to.be.a('function');
		expect(api.listeners).to.be.a('function');
		expect(api.off).to.be.a('function');
		expect(api.on).to.be.a('function');
		expect(api.once).to.be.a('function');
		expect(api.removeAllListeners).to.be.a('function');
		expect(api.removeListener).to.be.a('function');
		expect(api.setMaxListeners).to.be.a('function');
	});

	it('should relay events to Api class', function() {
		var files = {
			'/project/.skivvyrc': '{}'
		};
		unmockFiles = mockFiles(files);

		var api = new Api('/project');

		var eventNames = Object.keys(Api.events).map(function(key) {
			return Api.events[key];
		});

		var eventLog = [];

		eventNames.forEach(function(eventName) {
			Api.addListener(eventName, function() {
				eventLog.push({
					event: eventName,
					args: Array.prototype.slice.call(arguments)
				});
			});
		});


		eventNames.forEach(function(eventName) {
			api.emit(eventName, 1, 2, 3);
		});

		expect(eventLog).to.eql(eventNames.map(function(eventName) {
			return {
				event: eventName,
				args: [1, 2, 3]
			};
		}));
	});

	it('should throw an error if the path does not exist', function() {
		var files = {};
		unmockFiles = mockFiles(files);

		var actual = function() { return new Api('/invalid'); };
		expect(actual).to.throw(InvalidProjectError);
	});

	it('should throw an error if the path does not contain a config file', function() {
		var files = {
			'/project': {}
		};
		unmockFiles = mockFiles(files);

		var actual = function() { return new Api('/project'); };
		expect(actual).to.throw(InvalidProjectError);
	});

	it('should throw an error if the path contains an empty config file', function() {
		var files = {
			'/project/.skivvyrc': ''
		};
		unmockFiles = mockFiles(files);

		var actual = function() { return new Api('/project'); };
		expect(actual).to.throw(InvalidProjectError);
	});

	it('should throw an error if the path contains an invalid config file', function() {
		var files = {
			'/project/.skivvyrc': '{'
		};
		unmockFiles = mockFiles(files);

		var actual = function() { return new Api('/project'); };
		expect(actual).to.throw(InvalidProjectError);
	});
});
