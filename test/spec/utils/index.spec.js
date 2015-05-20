'use strict';

var chai = require('chai');
var expect = chai.expect;

var utils = require('../../../lib/utils');

describe('utils', function() {

	it('should expose the correct utility methods', function() {
		expect(utils.log).to.be.a('function');
		expect(utils.log.debug).to.be.a('function');
		expect(utils.log.info).to.be.a('function');
		expect(utils.log.warn).to.be.a('function');
		expect(utils.log.error).to.be.a('function');
		expect(utils.log.success).to.be.a('function');

		expect(utils.colors.path).to.be.a('function');
		expect(utils.colors.package).to.be.a('function');
		expect(utils.colors.task).to.be.a('function');
		expect(utils.colors.time).to.be.a('function');
	});
});
