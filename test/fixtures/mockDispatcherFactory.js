'use strict';

var sinon = require('sinon');

module.exports = function(dispatcher) {
	return spyOn(dispatcher);
};


function spyOn(subject) {
	var memberNames = Object.keys(subject.constructor.prototype);

	var spies = memberNames.filter(function(methodName) {
			return typeof subject[methodName] === 'function';
		})
		.map(function(methodName) {
			var method = subject[methodName];
			var spy = sinon.spy(method);
			subject[methodName] = spy;
			return spy;
		});

	return memberNames.reduce(
		function(stub, memberName) {
			stub[memberName] = subject[memberName];
			return stub;
		},
		{
			reset: function() {
				spies.forEach(function(spy) {
					spy.reset();
				});
			}
		}
	);
}
