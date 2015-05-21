'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockCli = require('mock-cli');
var chalk = require('chalk');

var mockFiles = require('../../utils/mock-files');

var cliList = require('../../../lib/cli/list');

describe('cli.list()', function() {
	var unmockCli = null;
	var unmockFiles = null;


	var pkg = {
		name: 'hello-world',
		version: '1.0.0'
	};
	var config = {
		environment: {
			default: {}
		},
		packages: {}
	};

	afterEach(function() {
		if (unmockFiles) {
			unmockFiles();
			unmockFiles = null;
		}
		if (unmockCli) {
			unmockCli();
			unmockCli = null;
		}
	});

	it('should handle empty projects (quiet)', function(done) {
		var files = {
			'package.json': JSON.stringify(pkg),
			'.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var args = [];
		var options = {
			quiet: true
		};
		var expected, actual;
		expected = '\n';

		unmockCli = mockCli(['node', 'script.js']);
		cliList(args, options, function(error, output) {
			var cli = unmockCli();
			unmockCli = null;

			if (error) { return done(error); }

			actual = output;
			expect(actual).to.equal(expected);

			actual = cli.stdout;
			expect(actual).to.equal(expected);

			done();
		});
	});

	it('should handle empty projects (verbose)', function(done) {
		var files = {
			'package.json': JSON.stringify(pkg),
			'.skivvyrc': JSON.stringify(config)
		};
		unmockFiles = mockFiles(files);

		var args = [];
		var options = {};
		var expected, actual;
		expected = [
			'hello-world@1.0.0',
			'└── ' + chalk.dim('[ No tasks ]'),
			''
		].join('\n');

		unmockCli = mockCli(['node', 'script.js']);
		cliList(args, options, function(error, output) {
			var cli = unmockCli();
			unmockCli = null;

			if (error) { return done(error); }

			actual = output;
			expect(actual).to.equal(expected);

			actual = cli.stdout;
			expect(actual).to.equal(expected);

			done();
		});
	});

	it('should handle empty packages (quiet)', function(done) {
		var files = {
			'package.json': JSON.stringify(pkg),
			'.skivvyrc': JSON.stringify(config),
			'node_modules/skivvy-package-empty-package/index.js': 'exports.tasks = {};',
			'node_modules/@my-packages/skivvy-package-empty-package/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var args = [];
		var options = {
			quiet: true
		};
		var expected, actual;
		expected = '\n';

		unmockCli = mockCli(['node', 'script.js']);
		cliList(args, options, function(error, output) {
			var cli = unmockCli();
			unmockCli = null;

			if (error) { return done(error); }

			actual = output;
			expect(actual).to.equal(expected);

			actual = cli.stdout;
			expect(actual).to.equal(expected);

			done();
		});
	});

	it('should handle empty packages (verbose)', function(done) {
		var files = {
			'package.json': JSON.stringify(pkg),
			'.skivvyrc': JSON.stringify(config),
			'node_modules/skivvy-package-empty-package/package.json': '{ "name": "skivvy-package-empty-package", "version": "1.2.3" }',
			'node_modules/skivvy-package-empty-package/index.js': 'exports.tasks = {};',
			'node_modules/@my-packages/skivvy-package-empty-package/package.json': '{ "name": "@my-packages/skivvy-package-empty-package", "version": "1.2.3" }',
			'node_modules/@my-packages/skivvy-package-empty-package/index.js': 'exports.tasks = {};'
		};
		unmockFiles = mockFiles(files);

		var args = [];
		var options = {};
		var expected, actual;
		expected = [
			'hello-world@1.0.0',
			'├─┬ ' + chalk.bold('@my-packages/empty-package') + '@1.2.3',
			'│ └── ' + chalk.dim('[ No tasks ]'),
			'└─┬ ' + chalk.bold('empty-package') + '@1.2.3',
			'  └── ' + chalk.dim('[ No tasks ]'),
			''
		].join('\n');

		unmockCli = mockCli(['node', 'script.js']);
		cliList(args, options, function(error, output) {
			var cli = unmockCli();
			unmockCli = null;

			if (error) { return done(error); }

			actual = output;
			expect(actual).to.equal(expected);

			actual = cli.stdout;
			expect(actual).to.equal(expected);

			done();
		});
	});

	it('should list installed packages (quiet)', function(done) {
		var files = {
			'package.json': JSON.stringify(pkg),
			'.skivvyrc': JSON.stringify(config),
			'skivvy_tasks/local1.js': 'module.exports = function(config) { }; module.exports.description = \'Local task 1\';',
			'skivvy_tasks/local2.js': 'module.exports = function(config) { }; module.exports.description = \'Local task 2\';',
			'node_modules/skivvy-package-my-package/index.js': 'exports.tasks = { \'external1\': require(\'./tasks/external1\'), \'external2\': require(\'./tasks/external2\') };',
			'node_modules/skivvy-package-my-package/tasks/external1.js': 'module.exports = function(config) { }; module.exports.description = \'External task 1\';',
			'node_modules/skivvy-package-my-package/tasks/external2.js': 'module.exports = function(config) { }; module.exports.description = \'External task 2\';',
			'node_modules/@my-packages/skivvy-package-my-package/index.js': 'exports.tasks = { \'scoped1\': require(\'./tasks/scoped1\'), \'scoped2\': require(\'./tasks/scoped2\') };',
			'node_modules/@my-packages/skivvy-package-my-package/tasks/scoped1.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } }; module.exports.callback = null; module.exports.description = \'Scoped task 1\';',
			'node_modules/@my-packages/skivvy-package-my-package/tasks/scoped2.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } }; module.exports.callback = null; module.exports.description = \'Scoped task 2\';'
		};
		unmockFiles = mockFiles(files);

		var args = [];
		var options = {
			quiet: true
		};
		var expected, actual;
		expected = [
			'local1',
			'local2',
			'@my-packages/my-package::scoped1',
			'@my-packages/my-package::scoped2',
			'my-package::external1',
			'my-package::external2',
			''
		].join('\n');

		unmockCli = mockCli(['node', 'script.js']);
		cliList(args, options, function(error, output) {
			var cli = unmockCli();
			unmockCli = null;

			if (error) { return done(error); }

			actual = output;
			expect(actual).to.equal(expected);

			actual = cli.stdout;
			expect(actual).to.equal(expected);

			done();
		});
	});

	it('should list installed packages (verbose)', function(done) {
		var files = {
			'package.json': JSON.stringify(pkg),
			'.skivvyrc': JSON.stringify(config),
			'skivvy_tasks/local1.js': 'module.exports = function(config) { }; module.exports.description = \'Local task 1\';',
			'skivvy_tasks/local2.js': 'module.exports = function(config) { }; module.exports.description = \'Local task 2\';',
			'node_modules/skivvy-package-my-package/package.json': '{ "name": "skivvy-package-my-package", "version": "1.2.3" }',
			'node_modules/skivvy-package-my-package/index.js': 'exports.tasks = { \'external1\': require(\'./tasks/external1\'), \'external2\': require(\'./tasks/external2\') };',
			'node_modules/skivvy-package-my-package/tasks/external1.js': 'module.exports = function(config) { }; module.exports.description = \'External task 1\';',
			'node_modules/skivvy-package-my-package/tasks/external2.js': 'module.exports = function(config) { }; module.exports.description = \'External task 2\';',
			'node_modules/@my-packages/skivvy-package-my-package/package.json': '{ "name": "@my-packages/skivvy-package-my-package", "version": "1.2.3" }',
			'node_modules/@my-packages/skivvy-package-my-package/index.js': 'exports.tasks = { \'scoped1\': require(\'./tasks/scoped1\'), \'scoped2\': require(\'./tasks/scoped2\') };',
			'node_modules/@my-packages/skivvy-package-my-package/tasks/scoped1.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } }; module.exports.callback = null; module.exports.description = \'Scoped task 1\';',
			'node_modules/@my-packages/skivvy-package-my-package/tasks/scoped2.js': 'module.exports = function(config) { if (module.exports.callback) { module.exports.callback(config); } }; module.exports.callback = null; module.exports.description = \'Scoped task 2\';'
		};
		unmockFiles = mockFiles(files);

		var args = [];
		var options = {};
		var expected, actual;
		expected = [
			'hello-world@1.0.0',
			'├── local1 - Local task 1',
			'├── local2 - Local task 2',
			'├─┬ ' + chalk.bold('@my-packages/my-package') + '@1.2.3',
			'│ ├── scoped1 - Scoped task 1',
			'│ └── scoped2 - Scoped task 2',
			'└─┬ ' + chalk.bold('my-package') + '@1.2.3',
			'  ├── external1 - External task 1',
			'  └── external2 - External task 2',
			''
		].join('\n');

		unmockCli = mockCli(['node', 'script.js']);
		cliList(args, options, function(error, output) {
			var cli = unmockCli();
			unmockCli = null;

			if (error) { return done(error); }

			actual = output;
			expect(actual).to.equal(expected);

			actual = cli.stdout;
			expect(actual).to.equal(expected);

			done();
		});
	});
});
