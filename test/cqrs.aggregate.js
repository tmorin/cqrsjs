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

describe('aggregate', function() {
    var defaultCqrs, defaultOwner, defaultNamespace, defaultHandlers, defaultListeners, defaultAggregates, defaultQueries, defaultPayload, defaultMetadata;

    beforeEach(function() {
        cqrs.debug = false;
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
        defaultPayload = {
            test: 'test'
        };
        defaultMetadata = {};
    });

    afterEach(function() {
        defaultCqrs.destroy();
    });

    describe('register twice an aggregate', function() {
        var agg1, agg2;
        beforeEach(function() {
            agg1 = defaultCqrs.aggregate('aggregate');
            agg2 = defaultCqrs.aggregate('aggregate');
        });
        it('should not be the same', function() {
            agg1.should.not.equal(agg2);
        });
        describe('register a command handler without an applied event', function() {
            var handler;
            beforeEach(function() {
                handler = sinon.stub();
                handler.returnsArg(0);
                agg1.when('command1').invoke(handler).apply();
            });
            it('should not have aggregate listeners', function() {
                /* jshint -W030 */
                defaultAggregates.should.be.empty;
                /* jshint +W030 */
            });
            describe('when a command is sent', function() {
                beforeEach(function() {
                    return defaultCqrs.send('command1', defaultPayload, defaultMetadata).should.become(defaultPayload);
                });
                it('handler should be called only once', function() {
                    /* jshint -W030 */
                    handler.should.have.been.calledOnce;
                    /* jshint +W030 */
                    handler.should.have.been.calledWith(defaultPayload, defaultMetadata);
                });
            });
        });
        describe('register a command handler and an event listener', function() {
            var handler, listener;
            beforeEach(function() {
                handler = sinon.stub();
                handler.returnsArg(0);
                agg1.when('command1').invoke(handler).apply('event1');
                agg2.when('command1').invoke(handler).apply('event1');
                listener = sinon.spy();
                agg1.on('event1').invoke(listener);
                agg2.on('event1').invoke(listener);
            });
            describe('when a command is sent', function() {
                beforeEach(function() {
                    return defaultCqrs.send('command1', defaultPayload, defaultMetadata).should.become(defaultPayload);
                });
                it('handler should be called only once', function() {
                    /* jshint -W030 */
                    handler.should.have.been.calledOnce;
                    /* jshint +W030 */
                    handler.should.have.been.calledWith(defaultPayload, defaultMetadata);
                });
                it('listener should be called twice', function() {
                    /* jshint -W030 */
                    listener.should.have.been.calledTwice;
                    /* jshint +W030 */
                    listener.should.have.been.calledWith(defaultPayload, defaultMetadata);
                });
            });
            describe('when a command is sent without metadata', function() {
                beforeEach(function() {
                    return defaultCqrs.send('command1', defaultPayload).should.become(defaultPayload);
                });
                it('handler should be called with a non null metadata', function() {
                    handler.should.have.been.calledWith(defaultPayload, sinon.match.object);
                });
            });
        });
        describe('register a command handler and an event listener', function() {
            var handler1, handler2, listener;
            beforeEach(function() {
                handler1 = sinon.stub();
                handler1.returnsArg(0);
                handler2 = sinon.stub();
                handler2.returnsArg(0);
                agg1.when('command1').invoke(handler1).apply('event1', 'event1bis');
                agg2.when('event1').invoke(handler2).apply('event2');
                listener = sinon.spy();
                agg1.on('event1bis').invoke(listener);
                agg2.on('event2').invoke(listener);
            });
            describe('when a command is sent', function() {
                beforeEach(function() {
                    return defaultCqrs.send('command1', defaultPayload, defaultMetadata).should.become(defaultPayload);
                });
                it('handler1 should be called only once', function() {
                    /* jshint -W030 */
                    handler1.should.have.been.calledOnce;
                    /* jshint +W030 */
                    handler1.should.have.been.calledWith(defaultPayload, defaultMetadata);
                });
                it('handler2 should be called only once', function() {
                    /* jshint -W030 */
                    handler2.should.have.been.calledOnce;
                    /* jshint +W030 */
                    handler2.should.have.been.calledWith(defaultPayload, defaultMetadata);
                });
                it('listener should be called twice', function() {
                    /* jshint -W030 */
                    listener.should.have.been.calledTwice;
                    /* jshint +W030 */
                    listener.should.have.been.calledWith(defaultPayload, defaultMetadata);
                });
            });
        });
        describe('register a command handler (for each applying) and an event listener', function() {
            var handler, listener1, listener2;
            beforeEach(function() {
                defaultPayload = ['a', 'b', 'c'];
                handler = sinon.stub();
                handler.returnsArg(0);
                agg1.when('command1').invoke(handler).forEach().apply('event1', 'event1bis');
                listener1 = sinon.spy();
                listener2 = sinon.spy();
                agg1.on('event1').invoke(listener1);
                agg1.on('event1bis').invoke(listener2);
            });
            describe('when a command is sent', function() {
                beforeEach(function() {
                    return defaultCqrs.send('command1', defaultPayload, defaultMetadata).should.become(defaultPayload);
                });
                it('handler should be called only once', function() {
                    /* jshint -W030 */
                    handler.should.have.been.calledOnce;
                    /* jshint +W030 */
                    handler.should.have.been.calledWith(defaultPayload, defaultMetadata);
                });
                it('listener1 should be called thrice', function() {
                    /* jshint -W030 */
                    listener1.should.have.been.calledThrice;
                    /* jshint +W030 */
                    listener1.getCall(0).args[0].should.eq('a');
                    listener1.getCall(1).args[0].should.eq('b');
                    listener1.getCall(2).args[0].should.eq('c');
                });
                it('listener2 should be called thrice', function() {
                    /* jshint -W030 */
                    listener2.should.have.been.calledThrice;
                    /* jshint +W030 */
                    listener2.getCall(0).args[0].should.eq('a');
                    listener2.getCall(1).args[0].should.eq('b');
                    listener2.getCall(2).args[0].should.eq('c');
                });
            });
            describe('when a command is sent without payload', function() {
                beforeEach(function() {
                    return defaultCqrs.send('command1').should.become(sinon.match.undefined);
                });
                it('handler should be called with a non null metadata', function() {
                    handler.should.have.been.calledWith(sinon.match.undefined, sinon.match.object);
                });
            });
        });
        describe('register a command handler (with promise) and an event listener', function() {
            var handler, listener;
            beforeEach(function() {
                handler = sinon.stub();
                handler.returns(Promise.resolve().then(function() {
                    return defaultPayload;
                }));
                agg1.when('command1').invoke(handler).apply('event1');
                listener = sinon.spy();
                agg1.on('event1').invoke(listener);
                agg2.on('event1').invoke(listener);
            });
            describe('when a command is sent', function() {
                beforeEach(function() {
                    return defaultCqrs.send('command1', defaultPayload, defaultMetadata).should.become(defaultPayload);
                });
                it('listener should be called twice', function() {
                    /* jshint -W030 */
                    listener.should.have.been.calledTwice;
                    /* jshint +W030 */
                    listener.should.have.been.calledWith(defaultPayload, defaultMetadata);
                });
            });
        });
    });

});
