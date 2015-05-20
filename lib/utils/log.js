'use strict';

var dateFormat = require('dateformat');
var compileTemplate = require('es6-template-strings/compile');
var resolveToString = require('es6-template-strings/resolve-to-string');

var colors = require('./colors');

var LOG_TEMPLATE = require('./constants').LOG_TEMPLATE;
var LOG_TIMESTAMP_FORMAT = require('./constants').LOG_TIMESTAMP_FORMAT;

var compiledLogTemplate = compileTemplate(LOG_TEMPLATE);

function log(message) {
	var now = Date.now();
	var timestampString = dateFormat(now, LOG_TIMESTAMP_FORMAT);
	var concatenatedMessage = (message ? Array.prototype.join.call(arguments, ' ') : '');
	var template = compiledLogTemplate;
	var context = {
		timestamp: timestampString,
		message: concatenatedMessage
	};
	var output = resolveToString(template, context);
	console.log(output);
}

log.debug = function(message) {
	var concatenatedMessage = message ? Array.prototype.join.call(arguments, ' ') : '';
	return log(colors.debug(concatenatedMessage));
};

log.info = function(message) {
	var concatenatedMessage = message ? Array.prototype.join.call(arguments, ' ') : '';
	return log(colors.info(concatenatedMessage));
};

log.warn = function(message) {
	var concatenatedMessage = message ? Array.prototype.join.call(arguments, ' ') : '';
	return log(colors.warning(concatenatedMessage));
};

log.error = function(message) {
	var concatenatedMessage = message ? Array.prototype.join.call(arguments, ' ') : '';
	return log(colors.error(concatenatedMessage));
};

log.success = function(message) {
	var concatenatedMessage = message ? Array.prototype.join.call(arguments, ' ') : '';
	return log(colors.success(concatenatedMessage));
};

module.exports = log;
