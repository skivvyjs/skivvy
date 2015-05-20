'use strict';

var compileTemplate = require('es6-template-strings/compile');
var resolveToString = require('es6-template-strings/resolve-to-string');
var prettyMs = require('pretty-ms');

var log = require('./log');
var colors = require('./colors');

var LOG_TIMER_START_TEMPLATE = require('./constants').LOG_TIMER_START_TEMPLATE;
var LOG_TIMER_END_TEMPLATE = require('./constants').LOG_TIMER_END_TEMPLATE;
var LOG_LABELED_TIMER_START_TEMPLATE = require('./constants').LOG_LABELED_TIMER_START_TEMPLATE;
var LOG_LABELED_TIMER_END_TEMPLATE = require('./constants').LOG_LABELED_TIMER_END_TEMPLATE;

var compiledTimerStartTemplate = compileTemplate(LOG_TIMER_START_TEMPLATE);
var compiledTimerEndTemplate = compileTemplate(LOG_TIMER_END_TEMPLATE);
var compiledLabeledTimerStartTemplate = compileTemplate(LOG_LABELED_TIMER_START_TEMPLATE);
var compiledLabeledTimerEndTemplate = compileTemplate(LOG_LABELED_TIMER_END_TEMPLATE);

var activeTimers = {};

exports.start = function(label) {
	if (label || (label === '')) {
		logTimerStart(label || null);
	}

	var token = createToken();
	activeTimers[token] = process.hrtime();
	return token;


	function logTimerStart(label) {
		var template = (typeof label === 'string' ? compiledLabeledTimerStartTemplate : compiledTimerStartTemplate);
		var context = {
			label: label
		};
		var output = resolveToString(template, context);
		log.debug(output);
	}
};

exports.end = function(token, label) {
	var elapsed = token && activeTimers[token] && process.hrtime(activeTimers[token]);

	if (!token || !activeTimers.hasOwnProperty(token) || (typeof token !== 'string')) {
		throw new Error('Invalid token: ' + token);
	}

	delete activeTimers[token];

	var elapsedSeconds = elapsed[0];
	var elapsedNanoseconds = elapsed[1];
	var elapsedMilliseconds = Math.round(elapsedSeconds * 1e3) + (elapsedNanoseconds / 1e6);

	if (label) {
		logTimerEnd(label, elapsedMilliseconds);
	}

	return elapsedMilliseconds;


	function logTimerEnd(label, elapsedMilliseconds) {
		var template = (typeof label === 'string' ? compiledLabeledTimerEndTemplate : compiledTimerEndTemplate);
		var context = {
			label: label,
			elapsed: colors.time(prettyMs(elapsedMilliseconds))
		};
		var output = resolveToString(template, context);
		log.debug(output);
	}
};

var uid = 0;
function createToken() {
	return (++uid).toString(16);
}
