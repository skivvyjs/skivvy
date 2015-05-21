'use strict';

var EventEmitter = require('events').EventEmitter;
var skivvyUtils = require('skivvy-utils');

exports.getEnvironmentConfig = require('./api/getEnvironmentConfig');
exports.getPackageConfig = require('./api/getPackageConfig');
exports.getTaskConfig = require('./api/getTaskConfig');
exports.initProject = require('./api/initProject');
exports.installPackage = require('./api/installPackage');
exports.uninstallPackage = require('./api/uninstallPackage');
exports.updatePackage = require('./api/updatePackage');
exports.listPackages = require('./api/listPackages');
exports.updateEnvironmentConfig = require('./api/updateEnvironmentConfig');
exports.updatePackageConfig = require('./api/updatePackageConfig');
exports.updateTaskConfig = require('./api/updateTaskConfig');
exports.run = require('./api/run');

exports.utils = skivvyUtils;

exports.events = require('./events');
exports.constants = require('./constants');
exports.errors = require('./errors');

var dispatcher = new EventEmitter();
exports.emit = dispatcher.emit.bind(dispatcher);
exports.on = dispatcher.on.bind(dispatcher);
exports.removeListener = dispatcher.removeListener.bind(dispatcher);
