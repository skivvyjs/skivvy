'use strict';

var chai = require('chai');
var expect = chai.expect;
var chaiAsPromised = require('chai-as-promised');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var Promise = require('promise');
var Stream = require('stream');

var runAsync = require('../../../lib/helpers/runAsync');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('helpers.runAsync()', function() {

	it('should resolve with a value for synchronous functions', function() {
		var task = sinon.spy(function() {
			return 'hello world';
		});

		var actual, expected;
		expected = 'hello world';
		actual = runAsync(task);
		return Promise.all([
			expect(task).to.have.been.called,
			expect(actual).to.eventually.equal(expected)
		]);
	});

	it('should pass arguments to functions', function() {
		var args = ['hello', 'world'];
		var task = sinon.spy(function(arg1, arg2) {
			return arg1 + ' ' + arg2;
		});

		var actual, expected;
		expected = 'hello world';
		actual = runAsync(task, args);
		return Promise.all([
			expect(task).to.have.been.calledWith(args[0], args[1]),
			expect(actual).to.eventually.equal(expected)
		]);
	});

	it('should reject with an error for synchronous functions', function() {
		var args = [];
		var task = sinon.spy(function(arg1, arg2) {
			throw new Error('Goodbye, world!');
		});

		var actual, expected;
		expected = 'Goodbye, world!';
		actual = runAsync(task, args);
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should handle asynchronous functions by returning a promise (success)', function() {
		var args = ['hello', 'world'];
		var task = sinon.spy(function(arg1, arg2) {
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					var returnValue = arg1 + ' ' + arg2;
					resolve(returnValue);
				});
			});
		});

		var actual, expected;
		expected = 'hello world';
		actual = runAsync(task, args);
		return Promise.all([
			actual.then(function() {
				expect(task).to.have.been.calledWith(args[0], args[1]);
			}),
			expect(actual).to.eventually.equal(expected)
		]);
	});

	it('should handle asynchronous functions by returning a promise (failure)', function() {
		var args = ['hello', 'world'];
		var task = sinon.spy(function(arg1, arg2) {
			return new Promise(function(resolve, reject) {
				setTimeout(function() {
					reject('Goodbye, world!');
				});
			});
		});

		var actual, expected;
		expected = 'Goodbye, world!';
		actual = runAsync(task, args);
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should handle asynchronous functions by returning a stream (success)', function() {
		var args = ['hello', 'world'];
		var dataSpy = sinon.spy();
		var completedSpy = sinon.spy();
		var task = sinon.spy(function(arg1, arg2) {
			var chunks = Array.prototype.slice.call(arguments);
			var stream = new Stream.Readable({ objectMode: true, highWaterMark: 1 });
			stream._read = function() {
				if (chunks.length === 0) {
					completedSpy();
					this.push(null);
				} else {
					dataSpy();
					this.push(chunks.shift());
				}
			};
			return stream;
		});

		var actual, expected;
		expected = undefined;
		actual = runAsync(task, args);
		return expect(actual).to.eventually.equal(expected)
			.then(function(returnValue) {
				expect(dataSpy).to.have.callCount(args.length);
				expect(completedSpy).to.have.been.calledOnce;
			});
	});

	it('should handle asynchronous functions by returning a stream (failure)', function() {
		var args = ['hello', 'world'];
		var dataSpy = sinon.spy();
		var completedSpy = sinon.spy();
		var task = sinon.spy(function(arg1, arg2) {
			var chunks = Array.prototype.slice.call(arguments);
			var stream = new Stream.Readable({ objectMode: true, highWaterMark: 1 });
			stream._read = function() {
				if (chunks.length === 0) {
					completedSpy();
					this.emit('error', new Error('Goodbye, world!'));
				} else {
					dataSpy();
					this.push(chunks.shift());
				}
			};
			return stream;
		});

		var actual, expected;
		expected = 'Goodbye, world!';
		actual = runAsync(task, args);
		return expect(actual).to.be.rejectedWith(expected)
			.then(function(returnValue) {
				expect(dataSpy).to.have.callCount(args.length);
				expect(completedSpy).to.have.been.calledOnce;

				actual = returnValue;
				expected = undefined;
				expect(actual).to.equal(expected);
			});
	});

	it('should handle asynchronous functions by providing a callback (void)', function() {
		var args = ['hello', 'world'];
		var task = sinon.spy(function(arg1, arg2, callback) {
			setTimeout(function() {
				callback();
			});
		});

		var actual, expected;
		expected = undefined;
		actual = runAsync(task, args);
		return Promise.all([
			actual.then(function() {
				expect(task).to.have.been.calledWith(args[0], args[1]);
			}),
			expect(actual).to.eventually.equal(expected)
		]);
	});

	it('should handle asynchronous functions by providing a callback (success)', function() {
		var args = ['hello', 'world'];
		var task = sinon.spy(function(arg1, arg2, callback) {
			setTimeout(function() {
				var returnValue = arg1 + ' ' + arg2;
				callback(null, returnValue);
			});
		});

		var actual, expected;
		expected = 'hello world';
		actual = runAsync(task, args);
		return Promise.all([
			actual.then(function() {
				expect(task).to.have.been.calledWith(args[0], args[1]);
			}),
			expect(actual).to.eventually.equal(expected)
		]);
	});

	it('should handle asynchronous functions by providing a callback (failure)', function() {
		var args = ['hello', 'world'];
		var task = sinon.spy(function(arg1, arg2, callback) {
			setTimeout(function() {
				callback(new Error('Goodbye, world!'));
			});
		});

		var actual, expected;
		expected = 'Goodbye, world!';
		actual = runAsync(task, args);
		return expect(actual).to.be.rejectedWith(expected);
	});

	it('should handle asynchronous functions by providing this.async() (success)', function() {
		var args = ['hello', 'world'];
		var task = sinon.spy(function(arg1, arg2) {
			var done = this.async();
			setTimeout(function() {
				done();
			});
		});

		var actual, expected;
		expected = undefined;
		actual = runAsync(task, args);
		return Promise.all([
			actual.then(function() {
				expect(task).to.have.been.calledWith(args[0], args[1]);
			}),
			expect(actual).to.eventually.equal(expected)
		]);
	});

	it('should handle asynchronous functions by providing this.async() (failure)', function() {
		var args = ['hello', 'world'];
		var task = sinon.spy(function(arg1, arg2) {
			var done = this.async();
			setTimeout(function() {
				done(false);
			});
		});

		var actual, expected;
		expected = Error;
		actual = runAsync(task, args);
		return expect(actual).to.be.rejectedWith(expected);
	});
});
