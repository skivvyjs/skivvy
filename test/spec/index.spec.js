'use strict';

var chai = require('chai');
var expect = chai.expect;
var mockery = require('mockery');
var sinonChai = require('sinon-chai');

chai.use(sinonChai);

var mockApiFactory = require('../fixtures/mockApiFactory');

describe('module', function() {
	var skivvy;
	var MockApi = mockApiFactory();
	before(function() {
		mockery.enable({
			useCleanCache: true,
			warnOnUnregistered: false
		});
		mockery.registerMock('./api', MockApi);
		skivvy = require('../../lib/index');
	});

	afterEach(function() {
		MockApi.reset(true);
	});

	after(function() {
		mockery.deregisterAll();
		mockery.disable();
	});

	it('should expose API events', function() {
		expect(skivvy.events).to.eql(MockApi.events);
	});

	it('should expose utils', function() {
		expect(skivvy.utils).to.be.an('object');
	});

	it('should expose EventEmitter methods', function() {
		expect(skivvy.addListener).to.be.a('function');
		expect(skivvy.emit).to.be.a('function');
		expect(skivvy.listeners).to.be.a('function');
		expect(skivvy.off).to.be.a('function');
		expect(skivvy.on).to.be.a('function');
		expect(skivvy.once).to.be.a('function');
		expect(skivvy.removeAllListeners).to.be.a('function');
		expect(skivvy.removeListener).to.be.a('function');
		expect(skivvy.setMaxListeners).to.be.a('function');
	});

	it('should relay events', function() {
		var eventNames = Object.keys(MockApi.events).map(function(key) {
			return MockApi.events[key];
		});

		var eventLog = [];
		eventNames.forEach(function(eventName) {
			skivvy.addListener(eventName, function() {
				eventLog.push({
					event: eventName,
					args: Array.prototype.slice.call(arguments)
				});
			});
		});

		eventNames.forEach(function(eventName) {
			MockApi.emit(eventName, 1, 2, 3);
		});

		expect(eventLog).to.eql(eventNames.map(function(eventName) {
			return {
				event: eventName,
				args: [1, 2, 3]
			};
		}));
	});

	it('should expose init method', function() {
		expect(skivvy.init).to.be.a('function');

		skivvy.init({
			path: '/project'
		});

		expect(MockApi.initProject).to.have.been.calledWith({
			path: '/project'
		});
	});

	it('should pass a callback in init method', function(done) {
		expect(skivvy.init).to.be.a('function');

		skivvy.init({
			path: '/project'
		}, callback);

		expect(MockApi.initProject).to.have.been.calledWith({
			path: '/project'
		}, callback);


		function callback() {
			done();
		}
	});

	it('should return a promise from init method', function() {
		var returnValue = skivvy.init({
			path: '/project'
		});
		expect(returnValue.then).to.be.a('function');
	});

	it('should expose api method', function() {
		expect(skivvy.api).to.be.a('function');

		var returnValue = skivvy.api({
			path: '/project'
		});

		expect(returnValue).to.exist;
		expect(returnValue).to.be.an.instanceof(MockApi);
		expect(returnValue.path).to.equal('/project');
	});
});
