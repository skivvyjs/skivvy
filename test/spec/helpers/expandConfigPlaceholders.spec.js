'use strict';

var chai = require('chai');
var expect = chai.expect;

var expandConfigPlaceholders = require('../../../lib/helpers/expandConfigPlaceholders');

describe('helpers.expandConfigPlaceholders()', function() {
	it('should return a copy of the original object', function() {
		var input, expected, actual;

		input = {
			template: {},
			context: {}
		};
		expected = {};
		actual = expandConfigPlaceholders(input.template, input.context);
		expect(actual).to.eql(expected);
		expect(actual).not.to.equal(expected);
	});

	it('should copy primitive values', function() {
		var input, expected, actual;

		input = {
			template: {
				string: 'Hello, world!',
				empty: '',
				true: true,
				false: false,
				0: 0,
				1: 1,
				2: 2,
				undefined: undefined,
				null: null
			},
			context: {}
		};
		expected = {
			string: 'Hello, world!',
			empty: '',
			true: true,
			false: false,
			0: 0,
			1: 1,
			2: 2,
			undefined: undefined,
			null: null
		};
		actual = expandConfigPlaceholders(input.template, input.context);
		expect(actual).to.eql(expected);
	});

	it('should copy dates', function() {
		var input, expected, actual;

		var date = new Date();
		input = {
			template: {
				date: date
			},
			context: {}
		};
		var result = expandConfigPlaceholders(input.template, input.context);

		actual = result.date;
		expected = Date;
		expect(actual).to.be.an.instanceof(expected);

		expected = result.date.getTime();
		actual = date.getTime();
		expect(actual).to.equal(expected);

		actual = result.date;
		expected = date;
		expect(actual).not.to.equal(expected);
	});

	it('should copy regular expressions', function() {
		var input, expected, actual;

		var regexp = /Hello, world!/gim;
		input = {
			template: {
				regexp: regexp
			},
			context: {}
		};
		var result = expandConfigPlaceholders(input.template, input.context);

		actual = result.regexp;
		expected = RegExp;
		expect(actual).to.be.an.instanceof(expected);

		expected = '/Hello, world!/gim';
		actual = result.regexp.toString();
		expect(actual).to.equal(expected);

		actual = result.regexp;
		expected = regexp;
		expect(actual).not.to.equal(expected);
	});

	it('should copy arrays', function() {
		var input, expected, actual;

		input = {
			template: {
				messages: [
					'Hello, world!',
					'Goodbye, world!'
				]
			},
			context: {}
		};
		expected = {
			messages: [
				'Hello, world!',
				'Goodbye, world!'
			]
		};
		var result = expandConfigPlaceholders(input.template, input.context);
		actual = result;
		expect(actual).to.eql(expected);

		actual = result.messages;
		expected = input.template.messages;
		expect(actual).not.to.equal(expected);
	});

	it('should copy objects', function() {
		var input, expected, actual;

		input = {
			template: {
				messages: {
					hello: 'Hello, world!',
					goodbye: 'Goodbye, world!'
				}
			},
			context: {}
		};
		expected = {
			messages: {
				hello: 'Hello, world!',
				goodbye: 'Goodbye, world!'
			}
		};
		actual = expandConfigPlaceholders(input.template, input.context);
		expect(actual).to.eql(expected);
	});

	it('should copy non-primitive values by reference', function() {
		var input, expected, actual;

		var testFunction = function test() {};
		var testInstance = new (function TestClass() { })();

		input = {
			template: {
				message: 'Hello, <%= user.name %>!',
				function: testFunction,
				instance: testInstance
			},
			context: {
				user: {
					name: 'world'
				}
			}
		};

		actual = expandConfigPlaceholders(input.template, input.context);
		expected = {
			message: 'Hello, world!',
			function: testFunction,
			instance: testInstance
		};
		expect(actual).to.eql(expected);
		expect(actual.function).to.equal(testFunction);
		expect(actual.instance).to.equal(testInstance);
	});

	it('should handle nested objects and arrays', function() {
		var input, expected, actual;

		input = {
			template: {
				object: {
					array: [
						'Hello, world!',
						'Goodbye, world!'
					]
				},
				array: [
					{
						hello: 'Hello, world!',
						goodbye: 'Goodbye, world!'
					}
				]
			},
			context: {}
		};
		expected = {
			object: {
				array: [
					'Hello, world!',
					'Goodbye, world!'
				]
			},
			array: [
				{
					hello: 'Hello, world!',
					goodbye: 'Goodbye, world!'
				}
			]
		};
		actual = expandConfigPlaceholders(input.template, input.context);
		expect(actual).to.eql(expected);
	});

	it('should expand placeholder values', function() {
		var input, expected, actual;

		input = {
			template: {
				message: '<%= message %>'
			},
			context: {
				message: 'Hello, world!'
			}
		};
		expected = {
			message: 'Hello, world!'
		};
		actual = expandConfigPlaceholders(input.template, input.context);
		expect(actual).to.eql(expected);
	});

	it('should expand nested values in placeholders', function() {
		var input, expected, actual;

		input = {
			template: {
				message: '<%= message.value %>'
			},
			context: {
				message: {
					value: 'Hello, world!'
				}
			}
		};
		expected = {
			message: 'Hello, world!'
		};
		actual = expandConfigPlaceholders(input.template, input.context);
		expect(actual).to.eql(expected);
	});

	it('should expand expressions in placeholders', function() {
		var input, expected, actual;

		input = {
			template: {
				message: '<%= message === "Hello, world!" ? "Goodbye, world!" : message %>'
			},
			context: {
				message: 'Hello, world!'
			}
		};
		expected = {
			message: 'Goodbye, world!'
		};
		actual = expandConfigPlaceholders(input.template, input.context);
		expect(actual).to.eql(expected);
	});

	it('should expand placeholders in nested objects', function() {
		var input, expected, actual;

		input = {
			template: {
				object: {
					array: [
						'<%= hello %>',
						'<%= goodbye %>'
					]
				},
				array: [
					{
						hello: '<%= hello %>',
						goodbye: '<%= goodbye %>'
					}
				]
			},
			context: {
				hello: 'Hello, world!',
				goodbye: 'Goodbye, world!'
			}
		};
		expected = {
			object: {
				array: [
					'Hello, world!',
					'Goodbye, world!'
				]
			},
			array: [
				{
					hello: 'Hello, world!',
					goodbye: 'Goodbye, world!'
				}
			]
		};
		actual = expandConfigPlaceholders(input.template, input.context);
		expect(actual).to.eql(expected);
	});

	it('should expand placeholders in interpolated strings', function() {
		var input, expected, actual;

		input = {
			template: {
				message: 'Hello, <%= user %>!'
			},
			context: {
				user: 'world'
			}
		};
		expected = {
			message: 'Hello, world!'
		};
		actual = expandConfigPlaceholders(input.template, input.context);
		expect(actual).to.eql(expected);
	});

	it('should allow multiple interpolations in one expression', function() {
		var input, expected, actual;

		input = {
			template: {
				message: '<%= greeting %>, <%= user %>!',
				stripped: '<%= greeting %><%= user %>'
			},
			context: {
				greeting: 'Hello',
				user: 'world'
			}
		};
		expected = {
			message: 'Hello, world!',
			stripped: 'Helloworld'
		};
		actual = expandConfigPlaceholders(input.template, input.context);
		expect(actual).to.eql(expected);
	});

	it('should expand nested values in interpolated strings', function() {
		var input, expected, actual;

		input = {
			template: {
				message: 'Hello, <%= user.name %>!'
			},
			context: {
				user: {
					name: 'world'
				}
			}
		};
		expected = {
			message: 'Hello, world!'
		};
		actual = expandConfigPlaceholders(input.template, input.context);
		expect(actual).to.eql(expected);
	});

	it('should expand expressions in interpolated strings', function() {
		var input, expected, actual;

		input = {
			template: {
				message: 'Hello, <%= user.name === "world" ? "there" : user.name %>!'
			},
			context: {
				user: {
					name: 'world'
				}
			}
		};
		expected = {
			message: 'Hello, there!'
		};
		actual = expandConfigPlaceholders(input.template, input.context);
		expect(actual).to.eql(expected);
	});

	it('should expand placeholders in nested interpolated strings', function() {
		var input, expected, actual;

		input = {
			template: {
				object: {
					array: [
						'Hello, <%= user %>!',
						'Goodbye, <%= user %>!'
					]
				},
				array: [
					{
						hello: 'Hello, <%= user %>!',
						goodbye: 'Goodbye, <%= user %>!'
					}
				]
			},
			context: {
				user: 'world'
			}
		};
		expected = {
			object: {
				array: [
					'Hello, world!',
					'Goodbye, world!'
				]
			},
			array: [
				{
					hello: 'Hello, world!',
					goodbye: 'Goodbye, world!'
				}
			]
		};
		actual = expandConfigPlaceholders(input.template, input.context);
		expect(actual).to.eql(expected);
	});

	it('should expand non-string placeholder values', function() {
		var input, expected, actual;

		var testDate = new Date();
		var testRegexp = /Hello, world!/gim;
		var testObject = {};
		var testArray = [];
		var testFunction = function() { };
		var testInstance = new (function Test() { })();
		input = {
			template: {
				yes: '<%= yes %>',
				no: '<%= no %>',
				zero: '<%= zero %>',
				one: '<%= one %>',
				two: '<%= two %>',
				date: '<%= date %>',
				regexp: '<%= regexp %>',
				object: '<%= object %>',
				array: '<%= array %>',
				function: '<%= fn %>',
				instance: '<%= instance %>'
			},
			context: {
				yes: true,
				no: false,
				zero: 0,
				one: 1,
				two: 2,
				date: testDate,
				regexp: testRegexp,
				object: testObject,
				array: testArray,
				fn: testFunction,
				instance: testInstance
			}
		};
		expected = {
			yes: true,
			no: false,
			zero: 0,
			one: 1,
			two: 2,
			date: testDate,
			regexp: testRegexp,
			object: testObject,
			array: testArray,
			function: testFunction,
			instance: testInstance
		};
		actual = expandConfigPlaceholders(input.template, input.context);
		expect(actual).to.eql(expected);
		expect(actual.date).to.equal(testDate);
		expect(actual.regexp).to.equal(testRegexp);
		expect(actual.object).to.equal(testObject);
		expect(actual.array).to.equal(testArray);
		expect(actual.function).to.equal(testFunction);
		expect(actual.instance).to.equal(testInstance);
	});

	it('should ignore whitespace around placeholder values', function() {
		var input, expected, actual;

		input = {
			template: {
				interpolation1: 'Hello, <%=user%>!',
				interpolation2: 'Hello, <%=user %>!',
				interpolation3: 'Hello, <%=user  %>!',
				interpolation4: 'Hello, <%= user%>!',
				interpolation5: 'Hello, <%= user %>!',
				interpolation6: 'Hello, <%= user  %>!',
				interpolation7: 'Hello, <%=  user%>!',
				interpolation8: 'Hello, <%=  user %>!',
				interpolation9: 'Hello, <%=  user  %>!',
				value1: '<%=value%>',
				value2: '<%=value %>',
				value3: '<%=value  %>',
				value4: '<%= value%>',
				value5: '<%= value %>',
				value6: '<%= value  %>',
				value7: '<%=  value%>',
				value8: '<%=  value %>',
				value9: '<%=  value  %>'
			},
			context: {
				user: 'world',
				value: true
			}
		};
		expected = {
			interpolation1: 'Hello, world!',
			interpolation2: 'Hello, world!',
			interpolation3: 'Hello, world!',
			interpolation4: 'Hello, world!',
			interpolation5: 'Hello, world!',
			interpolation6: 'Hello, world!',
			interpolation7: 'Hello, world!',
			interpolation8: 'Hello, world!',
			interpolation9: 'Hello, world!',
			value1: true,
			value2: true,
			value3: true,
			value4: true,
			value5: true,
			value6: true,
			value7: true,
			value8: true,
			value9: true

		};
		actual = expandConfigPlaceholders(input.template, input.context);
		expect(actual).to.eql(expected);
	});

	it('should throw errors for invalid placeholders', function() {
		var input, expected, actual;

		input = {
			template: {
				message: 'Hello, <%= user %>!'
			},
			context: {
			}
		};
		expected = Error;
		actual = function() {
			return expandConfigPlaceholders(input.template, input.context);
		};
		expect(actual).to.throw(expected);

		input = {
			template: {
				message: 'Hello, <%= user %>!'
			},
			context: null
		};
		expected = Error;
		actual = function() {
			return expandConfigPlaceholders(input.template, input.context);
		};
		expect(actual).to.throw(expected);
	});

	it('should throw an error if placeholder contains syntax errors', function() {
		var input, expected, actual;

		input = {
			template: {
				invalid: '<%= syntax. %>'
			},
			context: {
				syntax: {}
			}
		};
		expected = SyntaxError;
		actual = function() {
			return expandConfigPlaceholders(input.template, input.context);
		};
		expect(actual).to.throw(expected);
	});
});
