'use strict';

function Cache() {
	this._cache = {};
}

Cache.prototype.has = function(key) {
	return this._cache.hasOwnProperty(key);
};

Cache.prototype.get = function(key) {
	return this._cache[key];
};

Cache.prototype.set = function(key, value) {
	this._cache[key] = value;
};

Cache.prototype.delete = function(key) {
	var hasKey = this._cache.hasOwnProperty(key);
	if (!hasKey) { return false; }
	return delete this._cache[key];
};

Cache.prototype.clear = function() {
	this._cache = {};
};

module.exports = new Cache();
