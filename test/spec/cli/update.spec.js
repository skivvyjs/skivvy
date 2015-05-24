'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
var rewire = require('rewire');

var mockApiFactory = require('../../fixtures/mockApiFactory');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('cli.update()', function() {
	var cliUpdate;
	var MockApi;

	before(function() {
		MockApi = mockApiFactory();
		cliUpdate = rewire('../../../lib/cli/update');
		cliUpdate.__set__('Api', MockApi);
	});

	afterEach(function() {
		MockApi.reset();
	});

	it('should update all packages', function() {
		var args = [];
		var options = {};
		return cliUpdate(args, options)
			.then(function(updatedVersions) {
				expect(MockApi.instance.updatePackage).to.have.been.calledTwice;
				expect(MockApi.instance.updatePackage).to.have.been.calledWith({
					package: 'my-package'
				});
				expect(MockApi.instance.updatePackage).to.have.been.calledWith({
					package: '@my-packages/my-package'
				});
				expect(updatedVersions.length).to.equal(2);
				updatedVersions.forEach(function(updatedVersion) {
					expect(updatedVersion).to.be.a('string');
					expect(updatedVersion).not.to.be.empty;
				});
			});
	});

	it('should update single packages', function() {
		var args = ['my-package'];
		var options = {};
		return cliUpdate(args, options)
			.then(function(updatedVersions) {
				expect(MockApi.instance.updatePackage).to.have.been.calledWith({
					package: 'my-package'
				});
				expect(updatedVersions[0]).to.be.a('string');
				expect(updatedVersions[0]).not.to.be.empty;
			});
	});

	it('should update multiple packages', function() {
		var args = ['my-package', '@my-packages/my-package'];
		var options = {};
		return cliUpdate(args, options)
			.then(function(updatedVersions) {
				expect(MockApi.instance.updatePackage).to.have.been.calledTwice;
				expect(MockApi.instance.updatePackage).to.have.been.calledWith({
					package: 'my-package'
				});
				expect(MockApi.instance.updatePackage).to.have.been.calledWith({
					package: '@my-packages/my-package'
				});
				expect(updatedVersions.length).to.equal(2);
				updatedVersions.forEach(function(updatedVersion) {
					expect(updatedVersion).to.be.a('string');
					expect(updatedVersion).not.to.be.empty;
				});
			});
	});

	it('should pass the project path to the API', function() {
		var args = ['my-package'];
		var options = {
			path: '/project'
		};
		return cliUpdate(args, options)
			.then(function(returnValue) {
				expect(MockApi.instance.path).to.equal('/project');
			});
	});

	it('should default to process.cwd() if no project path is specified', function() {
		var args = ['my-package'];
		var options = {};
		return cliUpdate(args, options)
			.then(function(returnValue) {
				expect(MockApi.instance.path).to.equal(process.cwd());
			});
	});
});
