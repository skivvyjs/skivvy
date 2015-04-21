'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
var rewire = require('rewire');

var InvalidArgumentsError = require('../../../lib/errors').InvalidArgumentsError;

var mockApiFactory = require('../../fixtures/mockApiFactory');
var cliUninstall = rewire('../../../lib/cli/uninstall');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('cli.uninstall()', function() {
	var api = mockApiFactory();
	var resetApi;

	before(function() {
		resetApi = cliUninstall.__set__('api', api);
	});

	after(function() {
		resetApi();
	});

	afterEach(function() {
		api.reset();
	});

	it('should throw an error if no packages are specified', function() {
		var args = [];
		var options = {};
		var expected, actual;
		expected = InvalidArgumentsError;
		actual = cliUninstall(args, options);
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should uninstall single packages', function() {
		var args = ['my-package'];
		var options = {
			path: '/project'
		};
		var expected;
		expected = {
			package: 'my-package',
			path: '/project'
		};
		return cliUninstall(args, options)
			.then(function() {
				expect(api.uninstallPackage).to.have.been.calledWith(expected);
			});
	});

	it('should uninstall multiple packages', function() {
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

		return cliUninstall(args, options)
			.then(function() {
				expected.forEach(function(expected) {
					expect(api.uninstallPackage).to.have.been.calledWith(expected);
				});
			});
	});
});
