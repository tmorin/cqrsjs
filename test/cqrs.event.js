/*jshint strict:false */
/*globals describe:false, beforeEach:false, afterEach:false, it:false */

var cqrs = require('../lib/cqrs');

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var charAsPromised = require('chai-as-promised');

chai.should();
chai.use(sinonChai);
chai.use(charAsPromised);

describe('event', function() {
    var defaultCqrs, defaultOwner, defaultNamespace, defaultHandlers, defaultListeners, defaultAggregates, defaultQueries, defaultPayload, defaultMetadata;

    beforeEach(function() {
        cqrs.debug = true;
        defaultOwner = 'defaultCqrsInstance';
        defaultNamespace = 'defaultNamespace';
        defaultHandlers = [];
        defaultListeners = [];
        defaultAggregates = [];
        defaultQueries = [];
        cqrs.setDefaultRepos(defaultHandlers, defaultListeners, defaultAggregates, defaultQueries);
        defaultCqrs = cqrs({
            owner: defaultOwner,
            namespace: defaultNamespace
        });
        defaultPayload = {};
        defaultMetadata = {};
    });

    afterEach(function() {
        defaultCqrs.destroy();
    });

    describe('register twice an event listener', function() {
        var callback;
        beforeEach(function() {
            callback = sinon.spy();
            defaultCqrs.on('event1').invoke(callback);
            defaultCqrs.on('event1').invoke(callback);
        });
        describe('when an event is sent', function() {
            beforeEach(function() {
                return defaultCqrs.publish('event1', defaultPayload, defaultMetadata);
            });
            it('should be called twice', function() {
                /* jshint -W030 */
                callback.should.have.been.calledTwice;
                /* jshint +W030 */
                callback.should.have.been.calledWith(defaultPayload, defaultMetadata);
            });
        });
        describe('when an event is sent without metadata', function() {
            beforeEach(function() {
                return defaultCqrs.publish('event1', defaultPayload);
            });
            it('should be called with a non null metadata', function() {
                callback.should.have.been.calledWith(defaultPayload, sinon.match.object);
            });
        });
    });

});