'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');
var rewire = require('rewire');

var InvalidArgumentsError = require('../../../lib/errors').InvalidArgumentsError;

var mockApiFactory = require('../../fixtures/mockApiFactory');
var cliInstall = rewire('../../../lib/cli/install');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('cli.install()', function() {
	var api = mockApiFactory();
	var resetApi;

	before(function() {
		resetApi = cliInstall.__set__('api', api);
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
		actual = cliInstall(args, options);
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should install single packages', function() {
		var args = ['my-package'];
		var options = {
			path: '/project'
		};
		var expected;
		expected = {
			package: 'my-package',
			path: '/project'
		};
		return cliInstall(args, options)
			.then(function() {
				expect(api.installPackage).to.have.been.calledWith(expected);
			});
	});

	it('should install multiple packages', function() {
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

		return cliInstall(args, options)
			.then(function() {
				expected.forEach(function(expected) {
					expect(api.installPackage).to.have.been.calledWith(expected);
				});
			});
	});
});
