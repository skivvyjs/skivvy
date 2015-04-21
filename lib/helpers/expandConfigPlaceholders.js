'use strict';

var template = require('lodash.template');

module.exports = function(config, context) {
	var configJson = JSON.stringify(config);
	var containsPlaceholders = configJson.indexOf('<%') !== -1;
	if (!containsPlaceholders) { return JSON.parse(configJson); }
	var expandedJson = renderTemplate(configJson, context);
	return JSON.parse(expandedJson);


	function renderTemplate(templateString, context) {
		var templateFunction = template(templateString);
		return templateFunction(context);
	}
};
