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

describe('command', function() {
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

    describe('register twice a command handler', function() {
        var callback;
        beforeEach(function() {
            callback = sinon.spy();
            defaultCqrs.when('command1').invoke(callback);
            defaultCqrs.when('command1').invoke(callback);
        });
        describe('when a command is sent', function() {
            beforeEach(function() {
                return defaultCqrs.send('command1', defaultPayload, defaultMetadata);
            });
            it('should be called only once', function() {
                /* jshint -W030 */
                callback.should.have.been.calledOnce;
                /* jshint +W030 */
                callback.should.have.been.calledWith(defaultPayload, defaultMetadata);
            });
        });
        describe('when a command is sent whithout', function() {
            beforeEach(function() {
                return defaultCqrs.send('command1', defaultPayload);
            });
            it('should be called with a non null metadata', function() {
                callback.should.have.been.calledWith(defaultPayload, sinon.match.object);
            });
        });
    });

    describe('send a none existing command', function() {
        it('should be rejected', function() {
            return defaultCqrs.send('command1', defaultPayload).should.be.rejected;
        });
    });

});