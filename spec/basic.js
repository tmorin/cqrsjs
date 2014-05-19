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
        var defaultCommand, defaultCommandName, defaultPayload, defaultMetadata;

        beforeEach(function() {
            defaultCommandName = 'command1';
            defaultCommand = {
                owner: defaultOwner,
                commandName: [defaultNamespace, 'cmd', defaultCommandName].join('-'),
                callback: jasmine.createSpy('defaultCallback')
            };
            defaultHandlers.push(defaultCommand);
            defaultPayload = {};
            defaultMetadata = {};
        });

        describe('when command1 is sent', function() {
            var p;
            it('should return a promise', function(done) {
                p = defaultCqrs.send(defaultCommandName, defaultPayload, defaultMetadata);
                expect(typeof p.then).toBe('function');
                function always() {
                    expect(defaultCommand.callback).toHaveBeenCalled();
                    expect(defaultCommand.callback.calls.argsFor(0)).toBe(defaultPayload);
                    expect(defaultCommand.callback.calls.argsFor(1)).toBe(defaultMetadata);
                    done();
                }
                p.then(always, always);
            });
        });
    });

    describe('when cqrs#handle is called', function() {
        it('should register an handler', function() {
            var name = 'command1';
            var cb = jasmine.createSpy('cb');
            defaultCqrs.handle(name, cb);
            expect(defaultHandlers.length).toEqual(1);
            expect(defaultHandlers[0].owner).toEqual(defaultOwner);
            expect(defaultHandlers[0].commandName).toEqual([defaultNamespace, 'cmd', name].join('-'));
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
            expect(defaultHandlers[0].commandName).toEqual([defaultNamespace, 'cmd', name].join('-'));
            expect(defaultHandlers[0].callback).toEqual(cb1);
        });
    });

    describe('when cqrs#publish is called', function() {
        var defaultEvent, defaultListener1, defaultListener2, defaultPayload, defaultMetadata;

        beforeEach(function() {
            defaultEventName = 'event1';
            defaultListener1 = {
                owner: defaultOwner,
                eventName: [defaultNamespace, 'evt', defaultEventName].join('-'),
                callback: jasmine.createSpy('defaultListener1')
            };
            defaultListeners.push(defaultListener1);
            defaultListener2 = {
                owner: defaultOwner,
                eventName: [defaultNamespace, 'evt', defaultEventName].join('-'),
                callback: jasmine.createSpy('defaultListener2')
            };
            defaultListeners.push(defaultListener2);
            defaultPayload = {};
            defaultMetadata = {};
        });

        describe('when event1 is published', function() {
            it('should return a promise', function(done) {
                var p = defaultCqrs.publish(defaultEventName, defaultPayload, defaultMetadata);
                expect(typeof p.then).toBe('function');
                function always() {
                    expect(defaultListener1.callback).toHaveBeenCalled();
                    expect(defaultListener1.callback.calls.argsFor(0)).toBe(defaultPayload);
                    expect(defaultListener1.callback.calls.argsFor(1)).toBe(defaultMetadata);
                    expect(defaultListener2.callback).toHaveBeenCalled();
                    expect(defaultListener2.callback.calls.argsFor(0)).toBe(defaultPayload);
                    expect(defaultListener2.callback.calls.argsFor(1)).toBe(defaultMetadata);
                    done();
                }
                p.then(done, done);
            });
        });
    });

    describe('when cqrs#listen is called', function() {
        it('should register a listener', function() {
            var name = 'event1';
            var cb = jasmine.createSpy('cb');
            defaultCqrs.listen(name, cb);
            expect(defaultListeners.length).toEqual(1);
            expect(defaultListeners[0].owner).toEqual(defaultOwner);
            expect(defaultListeners[0].eventName).toEqual([defaultNamespace, 'evt', name].join('-'));
            expect(defaultListeners[0].callback).toEqual(cb);
        });
        it('should register listeners listenning the same event', function() {
            var name = 'event1';
            var cb1 = jasmine.createSpy('cb1');
            var cb2 = jasmine.createSpy('cb2');
            defaultCqrs.listen(name, cb1);
            defaultCqrs.listen(name, cb2);
            expect(defaultListeners.length).toEqual(2);
            expect(defaultListeners[0].owner).toEqual(defaultOwner);
            expect(defaultListeners[0].eventName).toEqual([defaultNamespace, 'evt', name].join('-'));
            expect(defaultListeners[0].callback).toEqual(cb1);
            expect(defaultListeners[1].owner).toEqual(defaultOwner);
            expect(defaultListeners[1].eventName).toEqual([defaultNamespace, 'evt', name].join('-'));
            expect(defaultListeners[1].callback).toEqual(cb2);
        });
    });

    describe('when cqrs#aggregate is called', function() {

        it('should provides ways to handle commands and to listen events', function() {
            var name = 'aggregate1';
            var cbHandleFn = false;
            var cbListenFn = false;
            var cb = function(handle, listen) {
                cbHandleFn = handle;
                cbListenFn = listen;
            };
            var aggregate = defaultCqrs.aggregate(name, cb);
            expect(!!cbHandleFn).toBe(true);
            expect(!!cbListenFn).toBe(true);
            expect(!!aggregate.handle).toBe(true);
            expect(!!aggregate.listen).toBe(true);
            expect(cbHandleFn).toBe(aggregate.handle);
            expect(cbListenFn).toBe(aggregate.listen);
        });

        describe('given a default aggregate instance', function() {
            var defaultAggregate, defaultAggregateName, defaultAggregateTechName;

            beforeEach(function() {
                defaultAggregateName = 'defaultAggregate';
                defaultAggregateTechName = [defaultNamespace, 'agg', defaultAggregateName].join('-')
                defaultAggregate = defaultCqrs.aggregate(defaultAggregateName);
            });

            describe('when aggregate#handle is called', function() {
                it('should register the handler', function() {
                    var name = 'command1';
                    var cb = jasmine.createSpy('cb');
                    defaultAggregate.handle(name, cb);
                    expect(defaultHandlers.length).toEqual(1);
                    expect(defaultHandlers[0].owner).toEqual(defaultOwner);
                    expect(defaultHandlers[0].commandName).toEqual([defaultNamespace, 'cmd', name].join('-'));
                    expect(typeof defaultHandlers[0].callback).toBe('function');
                });
                it('should not register handlers handling the same command', function() {
                    var name = 'command1';
                    var cb1 = jasmine.createSpy('cb1');
                    var cb2 = jasmine.createSpy('cb2');
                    defaultCqrs.handle(name, cb1);
                    defaultCqrs.handle(name, cb2);
                    expect(defaultHandlers.length).toEqual(1);
                    expect(defaultHandlers[0].owner).toEqual(defaultOwner);
                    expect(defaultHandlers[0].commandName).toEqual([defaultNamespace, 'cmd', name].join('-'));
                    expect(typeof defaultHandlers[0].callback).toBe('function');
                });
            });

            describe('when aggregate#listen is called', function() {
                it('should register the listener', function() {
                    var name = 'event1';
                    var techName = [defaultNamespace, 'evt', name].join('-')
                    var cb = jasmine.createSpy('cb');
                    defaultAggregate.listen(name, cb);
                    expect(defaultAggregates.length).toEqual(1);
                    expect(defaultAggregates[0].owner).toEqual(defaultOwner);
                    expect(defaultAggregates[0].aggregateName).toEqual(defaultAggregateTechName);
                    expect(defaultAggregates[0].listeners).toBeTruthy();
                    expect(defaultAggregates[0].listeners.length).toEqual(1);
                    expect(defaultAggregates[0].listeners[0].eventName).toEqual(techName);
                    expect(defaultAggregates[0].listeners[0].callback).toEqual(cb);
                });
                it('should register listeners handling the same event', function() {
                    var name = 'event1';
                    var techName = [defaultNamespace, 'evt', name].join('-')
                    var cb1 = jasmine.createSpy('cb1');
                    var cb2 = jasmine.createSpy('cb2');
                    defaultAggregate.listen(name, cb1);
                    defaultAggregate.listen(name, cb2);
                    expect(defaultAggregates.length).toEqual(1);
                    expect(defaultAggregates[0].owner).toEqual(defaultOwner);
                    expect(defaultAggregates[0].aggregateName).toEqual(defaultAggregateTechName);
                    expect(defaultAggregates[0].listeners).toBeTruthy();
                    expect(defaultAggregates[0].listeners.length).toEqual(2);
                    expect(defaultAggregates[0].listeners[0].eventName).toEqual(techName);
                    expect(defaultAggregates[0].listeners[0].callback).toEqual(cb1);
                    expect(defaultAggregates[0].listeners[1].eventName).toEqual(techName);
                    expect(defaultAggregates[0].listeners[1].callback).toEqual(cb2);
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
