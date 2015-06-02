'use strict';

var emitterMixin = require('emitter-mixin');

var DEFAULT_ENVIRONMENT_NAME = require('./constants').DEFAULT_ENVIRONMENT_NAME;

var Api = require('./api');

function Module() {
	var relayedEvents = Object.keys(Api.events).map(function(key) {
		return Api.events[key];
	});
	relayEvents(Api, this, relayedEvents);
}

emitterMixin(Module.prototype);

Module.prototype.events = Api.events;
Module.prototype.utils = Api.utils;

Module.prototype.init = function(options, callback) {
	return Api.initProject(options, callback);
};

Module.prototype.api = function(options) {
	options = options || {};
	var path = options.path || process.cwd();
	var environment = options.environment || DEFAULT_ENVIRONMENT_NAME;

	var api = new Api(path, environment);
	return api;
};


function relayEvents(source, target, events) {
	events.forEach(function(event) {
		source.on(event, function() {
			var args = Array.prototype.slice.call(arguments);
			target.emit.apply(target, [event].concat(args));
		});
	});
}

module.exports = new Module();
