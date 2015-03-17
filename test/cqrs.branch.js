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

describe('query', function() {
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
        defaultCqrs = cqrs();
        defaultPayload = {};
        defaultMetadata = {};
    });

    afterEach(function() {
        defaultCqrs.destroy();
    });

    describe('register a query', function() {
        var callback;
        beforeEach(function() {
            callback = sinon.stub();
            callback.returns('result');
            defaultCqrs.calling('query1').invoke(callback);
        });
        describe('when a query is called', function() {
            beforeEach(function() {
                return defaultCqrs.call('query1', 'arg1', 'arg2').should.eventually.equal('result');
            });
            it('should be called only once', function() {
                /* jshint -W030 */
                callback.should.have.been.calledOnce;
                /* jshint +W030 */
                callback.should.have.been.calledWith('arg1', 'arg2');
            });
        });
    });

});