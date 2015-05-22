'use strict';

var template = require('lodash.template');

var ATOMIC_PLACEHOLDER_REGEXP = /^<%= ((?:.(?!%>))+) %>$/;

module.exports = function(config, context) {
	return expandPlaceholders(config, context);


	function expandPlaceholders(value, context) {
		if (!value) {
			return value;
		} else if (typeof value === 'string') {
			var containsPlaceholders = value.indexOf('<%') !== -1;
			if (!containsPlaceholders) { return value; }
			return renderTemplate(value, context);
		} else if (value.constructor === Date) {
			return new Date(value);
		} else if (value.constructor === RegExp) {
			var flags = '';
			if (value.global) { flags += 'g'; }
			if (value.ignoreCase) { flags += 'i'; }
			if (value.multiline) { flags += 'm'; }
			return new RegExp(value.source, flags);
		} else if (Array.isArray(value)) {
			return value.map(function(childValue) {
				return expandPlaceholders(childValue, context);
			});
		} else if (value.constructor === Object) {
			return Object.keys(value).reduce(function(values, key) {
				var childValue = value[key];
				values[key] = expandPlaceholders(childValue, context);
				return values;
			}, {});
		} else {
			return value;
		}
	}

	function renderTemplate(templateString, context) {
		var atomicPlaceholderMatch = ATOMIC_PLACEHOLDER_REGEXP.exec(templateString);
		var templateFunction = template(templateString);
		if (atomicPlaceholderMatch) {
			var expression = atomicPlaceholderMatch[1];
			return getAtomicValue(expression, context);
		}
		return templateFunction(context);


		function getAtomicValue(expression, context) {
			var contextKeys = Object.keys(context);
			var contextValues = contextKeys.map(function(contextKey) {
				return context[contextKey];
			});
			var argumentNames = contextKeys;
			var argumentValues = contextValues;
			var functionBody = 'return ' + expression + ';';
			var getterFunction = Function.apply(null, argumentNames.concat([functionBody]));
			return getterFunction.apply(null, argumentValues);
		}
	}
};
