'use strict';

var sinon = require('sinon');

module.exports = function() {
	var log = sinon.spy(function(message, type) {
		log.messages.push({
			message: message,
			type: type || null
		});
	});
	log.messages = [];
	log.debug = sinon.spy(function(message) { log(message, 'debug'); });
	log.info = sinon.spy(function(message) { log(message, 'info'); });
	log.warn = sinon.spy(function(message) { log(message, 'warn'); });
	log.error = sinon.spy(function(message) { log(message, 'error'); });
	log.success = sinon.spy(function(message) { log(message, 'success'); });
	log.reset = (function(logReset) {
		return function() {
			log.messages.length = 0;
			logReset.call(log);
			log.debug.reset();
			log.info.reset();
			log.warn.reset();
			log.error.reset();
			log.success.reset();
		};
	})(log.reset);
	return log;
};
