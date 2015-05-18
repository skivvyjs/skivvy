'use strict';

var chai = require('chai');
var expect = chai.expect;

var configCache = require('../../../lib/helpers/configCache');

describe('helpers.configCache', function() {
	afterEach(function() {
		configCache.clear();
	});

	it('should implement .get() and .set()', function() {
		var expected, actual;

		expected = undefined;
		actual = configCache.get('key');
		expect(actual).to.equal(expected);

		expected = undefined;
		actual = configCache.set('key', 'value');
		expect(actual).to.equal(expected);

		expected = 'value';
		actual = configCache.get('key');
		expect(actual).to.equal(expected);
	});

	it('should implement .has()', function() {
		var expected, actual;

		expected = false;
		actual = configCache.has('key');
		expect(actual).to.equal(expected);

		configCache.set('key', 'value');

		expected = true;
		actual = configCache.has('key');
		expect(actual).to.equal(expected);
	});

	it('should implement .delete()', function() {
		var expected, actual;

		configCache.set('key', 'value');

		expected = false;
		actual = configCache.delete('nonexistent');
		expect(actual).to.equal(expected);

		expected = true;
		actual = configCache.delete('key');
		expect(actual).to.equal(expected);

		expected = false;
		actual = configCache.has('key');
		expect(actual).to.equal(expected);

		expected = undefined;
		actual = configCache.get('key');
		expect(actual).to.equal(expected);
	});

	it('should implement .clear()', function() {
		var expected, actual;

		configCache.set('key1', 'value1');
		configCache.set('key2', 'value2');

		expected = undefined;
		actual = configCache.clear();
		expect(actual).to.equal(expected);

		expected = false;
		actual = configCache.has('key1');
		expect(actual).to.equal(expected);

		expected = false;
		actual = configCache.has('key2');
		expect(actual).to.equal(expected);

		expected = undefined;
		actual = configCache.get('key1');
		expect(actual).to.equal(expected);

		expected = undefined;
		actual = configCache.get('key2');
		expect(actual).to.equal(expected);
	});
});
