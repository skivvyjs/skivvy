'use strict';

var emitterMixin = require('emitter-mixin');

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

	var api = new Api(path);
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
