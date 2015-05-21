'use strict';

var chai = require('chai');
var expect = chai.expect;

var api = require('../../lib/api');

describe('api', function() {
	it('should expose the correct API methods', function() {
		expect(api.initProject).to.be.a('function');
		expect(api.installPackage).to.be.a('function');
		expect(api.uninstallPackage).to.be.a('function');
		expect(api.updatePackage).to.be.a('function');
		expect(api.listPackages).to.be.a('function');
		expect(api.getEnvironmentConfig).to.be.a('function');
		expect(api.updateEnvironmentConfig).to.be.a('function');
		expect(api.getPackageConfig).to.be.a('function');
		expect(api.updatePackageConfig).to.be.a('function');
		expect(api.run).to.be.a('function');

		expect(api.on).to.be.a('function');
		expect(api.removeListener).to.be.a('function');

		expect(api.utils.log).to.be.a('function');
		expect(api.utils.log.debug).to.be.a('function');
		expect(api.utils.log.info).to.be.a('function');
		expect(api.utils.log.warn).to.be.a('function');
		expect(api.utils.log.error).to.be.a('function');
		expect(api.utils.log.success).to.be.a('function');
		expect(api.utils.colors.path).to.be.a('function');
		expect(api.utils.colors.package).to.be.a('function');
		expect(api.utils.colors.task).to.be.a('function');
		expect(api.utils.colors.time).to.be.a('function');
		expect(api.utils.timer.start).to.be.a('function');
		expect(api.utils.timer.end).to.be.a('function');
	});
});
