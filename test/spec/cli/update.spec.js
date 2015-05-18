'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
var rewire = require('rewire');

var mockApiFactory = require('../../fixtures/mockApiFactory');
var cliUpdate = rewire('../../../lib/cli/update');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('cli.update()', function() {
	var api = mockApiFactory();
	var resetApi;

	before(function() {
		resetApi = cliUpdate.__set__('api', api);
	});

	after(function() {
		resetApi();
	});

	afterEach(function() {
		api.reset();
	});

	it('should update all packages', function() {
		var args = [];
		var options = {
			path: '/project'
		};
		var expected;
		expected = [
			{
				package: 'my-package',
				path: '/project'
			},
			{
				package: '@my-packages/my-package',
				path: '/project'
			}
		];
		return cliUpdate(args, options)
			.then(function(updatedVersions) {
				expected.forEach(function(expected) {
					expect(api.updatePackage).to.have.been.calledWith(expected);
				});
				updatedVersions.forEach(function(updatedVersion) {
					expect(updatedVersion).to.be.a('string');
					expect(updatedVersion).not.to.be.empty;
				});
			});
	});

	it('should update single packages', function() {
		var args = ['my-package'];
		var options = {
			path: '/project'
		};
		var expected;
		expected = {
			package: 'my-package',
			path: '/project'
		};
		return cliUpdate(args, options)
			.then(function(updatedVersions) {
				expect(api.updatePackage).to.have.been.calledWith(expected);
				expect(updatedVersions[0]).to.be.a('string');
				expect(updatedVersions[0]).not.to.be.empty;
			});
	});

	it('should update multiple packages', function() {
		var args = ['my-package', '@my-packages/my-package'];
		var options = {
			path: '/project'
		};
		var expected;
		expected = [
			{
				package: 'my-package',
				path: '/project'
			},
			{
				package: '@my-packages/my-package',
				path: '/project'
			}
		];

		return cliUpdate(args, options)
			.then(function(updatedVersions) {
				expected.forEach(function(expected) {
					expect(api.updatePackage).to.have.been.calledWith(expected);
				});
				updatedVersions.forEach(function(updatedVersion) {
					expect(updatedVersion).to.be.a('string');
					expect(updatedVersion).not.to.be.empty;
				});
			});
	});
});
