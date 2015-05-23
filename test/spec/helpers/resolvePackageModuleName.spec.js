'use strict';

var chai = require('chai');
var expect = chai.expect;

var InvalidPackageError = require('../../../lib/errors').InvalidPackageError;

var resolvePackageModuleName = require('../../../lib/helpers/resolvePackageModuleName');

describe('helpers.resolvePackageModuleName()', function() {
	var unmockFiles = null;
	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
	});

	it('should throw an error if no package name was specified', function() {
		var expected, actual;
		expected = InvalidPackageError;
		actual = [
			function() { return resolvePackageModuleName(); },
			function() { return resolvePackageModuleName(undefined); },
			function() { return resolvePackageModuleName(null); },
			function() { return resolvePackageModuleName(false); },
			function() { return resolvePackageModuleName(''); }
		];
		actual.forEach(function(actual) {
			expect(actual).to.throw(expected);
		});
	});

	it('should resolve official package names', function() {
		var expected, actual;
		expected = '@skivvy/skivvy-package-hello';
		actual = resolvePackageModuleName('hello');
		expect(actual).to.equal(expected);
	});

	it('should resolve scoped package paths', function() {
		var expected, actual;
		expected = '@my-packages/skivvy-package-hello';
		actual = resolvePackageModuleName('@my-packages/hello', '/project');
		expect(actual).to.equal(expected);

		expected = '@skivvy/skivvy-package-hello';
		actual = resolvePackageModuleName('@skivvy/hello', '/project');
		expect(actual).to.equal(expected);
	});
});
