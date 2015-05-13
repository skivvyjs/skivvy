'use strict';

var extend = require('extend');

module.exports = function() {
	var deepCopy = true;
	var objects = Array.prototype.slice.call(arguments);
	return extend.apply(null, [deepCopy, {}].concat(objects));
};
