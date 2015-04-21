'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var mockFiles = require('../utils/mock-files');

var InvalidProjectError = require('../../lib/errors').InvalidProjectError;

chai.use(chaiAsPromised);

exports.addSyncProjectTests = function(apiCommand, title) {
	var isAsync = false;
	return addProjectTests(apiCommand, isAsync, title);
};

exports.addAsyncProjectTests = function(apiCommand, title) {
	var isAsync = true;
	return addProjectTests(apiCommand, isAsync, title);
};

function addProjectTests(apiCommand, isAsync, title) {
	return describe(title + ' - project-level tests', function() {
		var unmockFiles = null;

		afterEach(function() {
			if (unmockFiles) {
				unmockFiles();
				unmockFiles = null;
			}
		});

		it('should throw an error if the path does not exist', function() {
			var files = {};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = InvalidProjectError;
			actual = function() { return apiCommand({ path: '/project' }); };
			if (isAsync) {
				return expect(actual()).to.be.rejectedWith(expected);
			} else {
				return expect(actual).to.throw(expected);
			}
		});

		it('should throw an error if the path does not contain a config file', function() {
			var files = {
				'/project': {}
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = InvalidProjectError;
			actual = function() { return apiCommand({ path: '/project' }); };
			if (isAsync) {
				return expect(actual()).to.be.rejectedWith(expected);
			} else {
				return expect(actual).to.throw(expected);
			}
		});

		it('should throw an error if the path contains an empty config file', function() {
			var files = {
				'/project/skivvy.json': ''
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = InvalidProjectError;
			actual = function() { return apiCommand({ path: '/project' }); };
			if (isAsync) {
				return expect(actual()).to.be.rejectedWith(expected);
			} else {
				return expect(actual).to.throw(expected);
			}
		});

		it('should throw an error if the path contains an invalid config file', function() {
			var files = {
				'/project/skivvy.json': '{'
			};
			unmockFiles = mockFiles(files);

			var expected, actual;
			expected = InvalidProjectError;
			actual = function() { return apiCommand({ path: '/project' }); };
			if (isAsync) {
				return expect(actual()).to.be.rejectedWith(expected);
			} else {
				return expect(actual).to.throw(expected);
			}
		});
	});
}
