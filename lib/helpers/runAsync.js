'use strict';

var endOfStream = require('end-of-stream');
var consume = require('stream-consume');
var Promise = require('promise');

module.exports = function(fn, args, callback) {
	args = args || [];

	return new Promise(function(resolve, reject) {

		var cb = function(error, value) {
			if (error) {
				reject(error);
			} else {
				resolve(value);
			}
		};

		var taskAcceptsCallback = (fn.length === args.length + 1);
		if (taskAcceptsCallback) {
			fn.apply(null, args.concat(cb));
			return;
		}

		var returnValue = fn.apply(null, args);

		var isStream = Boolean(returnValue) && (typeof returnValue.pipe === 'function');
		var isPromise = Boolean(returnValue) && (typeof returnValue.then === 'function');
		if (isStream) {
			addStreamCallback(returnValue, cb);
		} else if (isPromise) {
			return resolve(returnValue);
		} else {
			return resolve(returnValue);
		}
	}).nodeify(callback);


	function addStreamCallback(stream, callback) {
		endOfStream(stream, {
			error: true,
			readable: stream.readable,
			writable: stream.writable && !stream.readable
		}, callback);
		consume(stream);
	}
};
