describe('given a default cqrs instance', function() {
    var defaultCqrs, defaultOwner, defaultNamespace, defaultHandlers, defaultListeners, defaultAggregates;

    beforeEach(function() {
        cqrs.debug = true;
        defaultOwner = 'defaultCqrsInstance';
        defaultNamespace = 'defaultNamespace';
        defaultHandlers = [];
        defaultListeners = [];
        defaultAggregates = [];
        cqrs.setDefaultRepos(defaultHandlers, defaultListeners, defaultAggregates);
        defaultCqrs = cqrs({
            owner: defaultOwner,
            namespace: defaultNamespace
        });
    });

    describe('when cqrs#send is called', function() {
        var defaultCommand, defaultPayload, defaultMetadata;

        beforeEach(function() {
            defaultCommand = {
                owner: defaultOwner,
                name: 'command1',
                defaultCallback: jasmine.createSpy('defaultCallback')
            };
            defaultHandlers.push(defaultCommand);
            defaultPayload = {};
            defaultMetadata = {};
        });

        describe('when command1 is sent', function() {
            it('should return a promise', function(done) {
                var p = defaultCqrs.send(defaultCommand.name, defaultPayload, defaultMetadata);
                expect(typeof p.then).toBe('function');
                p.then(done, done);
            });
            it('should execute the handler', function() {
                expect(defaultCommand.defaultCallback).toHaveBeenCalled();
                expect(defaultCommand.defaultCallback.calls.argsFor(0)).toBe(defaultPayload);
                expect(defaultCommand.defaultCallback.calls.argsFor(1)).toBe(defaultMetadata);
            });
        });
    });

    xdescribe('when cqrs#handle is called', function() {
        it('should register an handler', function() {
            var name = 'command1';
            var cb = jasmine.createSpy('cb');
            defaultCqrs.handle(name, cb);
            expect(defaultHandlers.length).toEqual(1);
            expect(defaultHandlers[0].owner).toEqual(defaultOwner);
            expect(defaultHandlers[0].name).toEqual(name);
            expect(defaultHandlers[0].callback).toEqual(cb);
        });
        it('should not register handlers handling the same command', function() {
            var name = 'command1';
            var cb1 = jasmine.createSpy('cb1');
            var cb2 = jasmine.createSpy('cb2');
            defaultCqrs.handle(name, cb1);
            defaultCqrs.handle(name, cb2);
            expect(defaultHandlers.length).toEqual(1);
            expect(defaultHandlers[0].owner).toEqual(defaultOwner);
            expect(defaultHandlers[0].name).toEqual(name);
            expect(defaultHandlers[0].callback).toEqual(cb1);
        });
    });

    xdescribe('when cqrs#publish is called', function() {
        var defaultEvent, defaultListener1, defaultListener2, defaultPayload, defaultMetadata;

        beforeEach(function() {
            defaultEvent = 'event1';
            defaultListener1 = {
                owner: defaultOwner,
                name: defaultEvent,
                defaultCallback: jasmine.createSpy('defaultListener1')
            };
            defaultListeners.push(defaultListener1);
            defaultListener2 = {
                owner: defaultOwner,
                name: defaultEvent,
                defaultCallback: jasmine.createSpy('defaultListener2')
            };
            defaultListeners.push(defaultListener2);
            defaultPayload = {};
            defaultMetadata = {};
        });

        xdescribe('when event1 is published', function() {
            it('should return a promise', function(done) {
                var p = defaultCqrs.publish(defaultEvent, defaultPayload, defaultMetadata);
                expect(typeof p.then).toBe('function');
                p.then(done, done);
            });
            it('should execute the listeners', function() {
                expect(defaultListener1.defaultCallback).toHaveBeenCalled();
                expect(defaultListener1.defaultCallback.calls.argsFor(0)).toBe(defaultPayload);
                expect(defaultListener1.defaultCallback.calls.argsFor(1)).toBe(defaultMetadata);
                expect(defaultListener2.defaultCallback).toHaveBeenCalled();
                expect(defaultListener2.defaultCallback.calls.argsFor(0)).toBe(defaultPayload);
                expect(defaultListener2.defaultCallback.calls.argsFor(1)).toBe(defaultMetadata);
            });
        });
    });

    xdescribe('when cqrs#listen is called', function() {
        it('should register a listener', function() {
            var name = 'event1';
            var cb = jasmine.createSpy('cb');
            defaultCqrs.listen(name, cb);
            expect(defaultListener.length).toEqual(1);
            expect(defaultListener[0].owner).toEqual(defaultOwner);
            expect(defaultListener[0].name).toEqual(name);
            expect(defaultListener[0].callback).toEqual(cb);
        });
        it('should register listeners listenning the same event', function() {
            var name = 'event1';
            var cb1 = jasmine.createSpy('cb1');
            var cb2 = jasmine.createSpy('cb2');
            defaultCqrs.listen(name, cb1);
            defaultCqrs.listen(name, cb2);
            expect(defaultListener.length).toEqual(2);
            expect(defaultListener[0].owner).toEqual(defaultOwner);
            expect(defaultListener[0].name).toEqual(name);
            expect(defaultListener[0].callback).toEqual(cb1);
            expect(defaultListener[1].owner).toEqual(defaultOwner);
            expect(defaultListener[1].name).toEqual(name);
            expect(defaultListener[1].callback).toEqual(cb2);
        });
    });

    xdescribe('when cqrs#aggregate is called', function() {

        it('should provides ways to handle commands and to listen events', function() {
            var name = 'aggregate1';
            var cbHandleFn = false;
            var cbListenFn = false;
            var cb = function(handle, listen) {
                cbHasHandleFn = handle;
                cbHasListenFn = listen;
            };
            var aggregate = defaultCqrs.aggregate(name, cb);
            expect(!!cbHasHandleFn).toBe(true);
            expect(!!cbHasListenFn).toBe(true);
            expect(!!aggregate.handle).toBe(true);
            expect(!!aggregate.listen).toBe(true);
            expect(cbHasHandleFn).toBe(aggregate.handle);
            expect(cbHasListenFn).toBe(aggregate.listen);
        });

        xdescribe('given a default aggregate instance', function() {
            var defaultAggregate, defaultAggregateName;

            beforeEach(function() {
                defaultAggregateName = 'defaultAggregate';
                defaultAggregate = defaultCqrs.aggregate(defaultAggregateName);
            });

            xdescribe('when aggregate#handle is called', function() {
                it('should register the handler', function() {
                    var name = 'command1';
                    var cb = jasmine.createSpy('cb');
                    defaultAggregate.handle(name, cb);
                    expect(defaultHandlers.length).toEqual(1);
                    expect(defaultHandlers[0].owner).toEqual(defaultOwner);
                    expect(defaultHandlers[0].name).toEqual(name);
                    expect(defaultHandlers[0].callback).toEqual(cb);
                });
                it('should not register handlers handling the same command', function() {
                    var name = 'command1';
                    var cb1 = jasmine.createSpy('cb1');
                    var cb2 = jasmine.createSpy('cb2');
                    defaultCqrs.handle(name, cb1);
                    defaultCqrs.handle(name, cb2);
                    expect(defaultHandlers.length).toEqual(1);
                    expect(defaultHandlers[0].owner).toEqual(defaultOwner);
                    expect(defaultHandlers[0].name).toEqual(name);
                    expect(defaultHandlers[0].callback).toEqual(cb1);
                });
            });

            xdescribe('when aggregate#listen is called', function() {
                it('should register the listener', function() {
                    var name = 'event1';
                    var cb = jasmine.createSpy('cb');
                    defaultAggregate.listen(name, cb);
                    expect(defaultAggregate.length).toEqual(1);
                    expect(defaultAggregate[0].owner).toEqual(defaultOwner);
                    expect(defaultAggregate[0].name).toEqual(defaultAggregateName);
                    expect(defaultAggregate[0].listeners).toBeTruthy();
                    expect(defaultAggregate[0].listeners.length).toEqual(1);
                    expect(defaultAggregate[0].listeners[0].name).toEqual(name);
                    expect(defaultAggregate[0].listeners[0].callback).toEqual(cb);
                });
                it('should not register listeners handling the same event', function() {
                    var name = 'event1';
                    var cb1 = jasmine.createSpy('cb1');
                    var cb2 = jasmine.createSpy('cb2');
                    defaultCqrs.listen(name, cb1);
                    defaultCqrs.listen(name, cb2);
                    expect(defaultAggregate.length).toEqual(1);
                    expect(defaultAggregate[0].owner).toEqual(defaultOwner);
                    expect(defaultAggregate[0].name).toEqual(defaultAggregateName);
                    expect(defaultAggregate[0].listeners).toBeTruthy();
                    expect(defaultAggregate[0].listeners.length).toEqual(1);
                    expect(defaultAggregate[0].listeners[0].name).toEqual(name);
                    expect(defaultAggregate[0].listeners[0].callback).toEqual(cb1);
                });
            });

            xdescribe('when aggregate#apply is called', function() {
                var defaultPayload, defaultMetadata, defaultEventName;
                var defaultAggregateEntry, defaultAggregateListenerCallback;

                beforeEach(function() {
                    defaultEventName = 'event1';
                    defaultAggregateListenerCallback = jasmine.createSpy('defaultAggregateListenerCallback');
                    defaultAggregateEntry = {
                        owner: defaultOwner,
                        name: defaultAggregateName,
                        listeners: [{
                            name: defaultEventName,
                            defaultCallback: defaultAggregateListenerCallback
                        }]
                    };
                    defaultAggregates.push(defaultAggregateEntry);
                    defaultPayload = {};
                    defaultMetadata = {};
                });

                xdescribe('when event1 is applied', function() {
                    it('should return a promise', function(done) {
                        var p = defaultAggregate.apply(defaultEventName, defaultPayload, defaultMetadata);
                        expect(typeof p.then).toBe('function');
                        p.then(done, done);
                    });
                    it('should execute the aggregate listener', function() {
                        expect(defaultListenerCallback).toHaveBeenCalled();
                        expect(defaultListenerCallback.calls.argsFor(0)).toBe(defaultPayload);
                        expect(defaultListenerCallback.calls.argsFor(1)).toBe(defaultMetadata);
                    });

                    xdescribe('when event1 is listenning external listener', function() {
                        var defaultListener1, defaultListener2;

                        beforeEach(function() {
                            defaultListener1 = {
                                owner: defaultOwner,
                                name: defaultEventName,
                                defaultCallback: jasmine.createSpy('defaultListener1')
                            };
                            defaultListeners.push(defaultListener1);
                            defaultListener2 = {
                                owner: defaultOwner,
                                name: defaultEventName,
                                defaultCallback: jasmine.createSpy('defaultListener2')
                            };
                            defaultListeners.push(defaultListener2);
                        });

                        it('should return a promise', function(done) {
                            var p = defaultAggregate.apply(defaultEventName, defaultPayload, defaultMetadata);
                            expect(typeof p.then).toBe('function');
                            p.then(done, done);
                        });
                        it('should execute the aggregate listener', function(done) {
                            // aggregate listeners
                            expect(defaultListenerCallback).toHaveBeenCalled();
                            expect(defaultListenerCallback.calls.argsFor(0)).toBe(defaultPayload);
                            expect(defaultListenerCallback.calls.argsFor(1)).toBe(defaultMetadata);
                            setTimeout(done, 10);
                        });
                        it('should execute the aggregate listener', function() {
                            // global listeners
                            expect(defaultListener1.defaultCallback).toHaveBeenCalled();
                            expect(defaultListener1.defaultCallback.calls.argsFor(0)).toBe(defaultPayload);
                            expect(defaultListener1.defaultCallback.calls.argsFor(1)).toBe(defaultMetadata);
                            expect(defaultListener2.defaultCallback).toHaveBeenCalled();
                            expect(defaultListener2.defaultCallback.calls.argsFor(0)).toBe(defaultPayload);
                            expect(defaultListener2.defaultCallback.calls.argsFor(1)).toBe(defaultMetadata);
                        });
                    });
                });
            });

        });
    });

});
