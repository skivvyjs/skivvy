'use strict';

var chalk = require('chalk');

exports.LOG_TEMPLATE = chalk.gray('[skivvy@${timestamp}]') + ' ${message}';
exports.LOG_TIMESTAMP_FORMAT = 'HH:MM:ss.l';
exports.LOG_TIMER_START_TEMPLATE = 'Timer started';
exports.LOG_TIMER_END_TEMPLATE = 'Timer ended: (elapsed time: ${elapsed})';
exports.LOG_LABELED_TIMER_START_TEMPLATE = 'Timer started: "${label}"';
exports.LOG_LABELED_TIMER_END_TEMPLATE = 'Timer ended: "${label}" (elapsed time: ${elapsed})';
