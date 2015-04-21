'use strict';

var dateFormat = require('dateformat');
var compileTemplate = require('es6-template-strings/compile');
var resolveToString = require('es6-template-strings/resolve-to-string');

var LOG_TEMPLATE = require('./constants').LOG_TEMPLATE;
var LOG_TIMESTAMP_FORMAT = require('./constants').LOG_TIMESTAMP_FORMAT;

var compiledLogTemplate = compileTemplate(LOG_TEMPLATE);

module.exports = function(message) {
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
};
