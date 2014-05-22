describe('given a default cqrs instance', function() {
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

    describe('when cqrs#send is called', function() {
        var defaultCommand, defaultCommandName;

        beforeEach(function(done) {
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
            beforeEach(function(done) {
                p = defaultCqrs.send(defaultCommandName, defaultPayload, defaultMetadata);
                p.then(done, done);
            });
            it('should return a promise', function() {
                expect(defaultCommand.callback).toHaveBeenCalled();
                expect(defaultCommand.callback).toHaveBeenCalledWith(defaultPayload, defaultMetadata, defaultCqrs.query);
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
        });

        describe('when event1 is published', function() {
            var p;
            beforeEach(function(done) {
                p = defaultCqrs.publish(defaultEventName, defaultPayload, defaultMetadata);
                p.then(done, done);
            });
            it('should return a promise', function() {
                expect(typeof p.then).toBe('function');
                expect(defaultListener1.callback).toHaveBeenCalled();
                expect(defaultListener1.callback).toHaveBeenCalledWith(defaultPayload, defaultMetadata);
                expect(defaultListener2.callback).toHaveBeenCalled();
                expect(defaultListener2.callback).toHaveBeenCalledWith(defaultPayload, defaultMetadata);
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
                defaultAggregateTechName = [defaultNamespace, 'agg', defaultAggregateName].join('-');
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
                it('should provides the apply function', function() {
                    var name = 'command1';
                    var cb = jasmine.createSpy('cb');
                    defaultAggregate.handle(name, cb);
                    expect(defaultHandlers.length).toEqual(1);
                    expect(defaultHandlers[0].owner).toEqual(defaultOwner);
                    expect(defaultHandlers[0].commandName).toEqual([defaultNamespace, 'cmd', name].join('-'));
                    expect(typeof defaultHandlers[0].callback).toBe('function');
                    defaultHandlers[0].callback(defaultPayload, defaultMetadata, defaultCqrs.query);
                    expect(cb).toHaveBeenCalled();
                    expect(cb).toHaveBeenCalledWith(defaultPayload, defaultMetadata, defaultCqrs.query, defaultAggregate.apply);
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
                    var techName = [defaultNamespace, 'evt', name].join('-');
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
                    var techName = [defaultNamespace, 'evt', name].join('-');
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

            describe('when aggregate#apply is called', function() {
                var defaultEventName, defaultEventTechName;
                var defaultAggregateEntry, defaultAggregateListenerCallback;

                beforeEach(function() {
                    defaultEventName = 'event1';
                    defaultEventTechName = [defaultNamespace, 'evt', defaultEventName].join('-');
                    defaultAggregateListenerCallback = jasmine.createSpy('defaultAggregateListenerCallback');
                    defaultAggregateEntry = {
                        owner: defaultOwner,
                        aggregateName: defaultAggregateTechName,
                        listeners: [{
                            eventName: defaultEventTechName,
                            callback: defaultAggregateListenerCallback
                        }]
                    };
                    defaultAggregates.push(defaultAggregateEntry);
                });

                describe('when event1 is applied', function() {
                    var p, defaultListener1, defaultListener2;

                    beforeEach(function(done) {
                        defaultListener1 = {
                            owner: defaultOwner,
                            eventName: defaultEventTechName,
                            callback: jasmine.createSpy('defaultListener1')
                        };
                        defaultListeners.push(defaultListener1);
                        defaultListener2 = {
                            owner: defaultOwner,
                            eventName: defaultEventTechName,
                            callback: jasmine.createSpy('defaultListener2')
                        };
                        defaultListeners.push(defaultListener2);
                        p = defaultAggregate.apply(defaultEventName, defaultPayload, defaultMetadata);
                        setTimeout(function() {
                            p.then(done, done);
                        }, 200);
                    });

                    it('should execute the aggregate listener and external listeners', function() {
                        // aggregate listeners
                        expect(defaultAggregateEntry.listeners[0].callback).toHaveBeenCalled();
                        expect(defaultAggregateEntry.listeners[0].callback).toHaveBeenCalledWith(defaultPayload, defaultMetadata);
                        // global listeners
                        expect(defaultListener1.callback).toHaveBeenCalled();
                        expect(defaultListener1.callback).toHaveBeenCalledWith(defaultPayload, defaultMetadata);
                        expect(defaultListener2.callback).toHaveBeenCalled();
                        expect(defaultListener2.callback).toHaveBeenCalledWith(defaultPayload, defaultMetadata);
                    });
                });
            });

        });
    });

    describe('when cqrs#quey is called', function() {
        var query1, query1Name, query1Function, query2, query2Name, query2Function;

        beforeEach(function() {
            query1Name = 'query1Name';
            query1Function = jasmine.createSpy('defaultListener1');
            var query1 = {
                owner: defaultOwner,
                namespace: defaultNamespace,
                queryName: query1Name,
                queryFunction: query1Function
            };
            defaultQueries.push(query1);
            query2Name = 'query2Name';
            query2Function = jasmine.createSpy('defaultListener1');
            var query2 = {
                owner: defaultOwner,
                namespace: defaultNamespace,
                queryName: query2Name,
                queryFunction: query2Function
            };
            defaultQueries.push(query2);
        });

        it('should return all queries', function() {
            var queries = defaultCqrs.query();
            expect(typeof queries.query1Name).toBe('function');
            expect(typeof queries.query2Name).toBe('function');
        });

        it('should invoke quer1Name', function(done) {
            var p = defaultCqrs.query().query1Name();
            expect(typeof p.then).toBe('function');
            function always() {
                expect(query1Function).toHaveBeenCalled();
                done();
            }
            p.then(always, always);
        });

    });

    describe('when cqrs#quey.add is called', function() {
        var query1Name, query1Function, query2Name, query2Function;

        beforeEach(function() {
            query1Name = 'query1Name';
            query1Function = jasmine.createSpy('defaultListener1');
            query2Name = query1Name;
            query2Function = jasmine.createSpy('defaultListener1');
        });

        it('should register query1', function() {
            defaultCqrs.query.add(query1Name, query1Function);
            expect(defaultQueries.length).toBe(1);
            expect(defaultQueries[0].owner).toBe(defaultOwner);
            expect(defaultQueries[0].namespace).toBe(defaultNamespace);
            expect(defaultQueries[0].queryName).toBe(query1Name);
            expect(defaultQueries[0].queryFunction).toBe(query1Function);
        });

        it('should not register query2', function() {
            defaultCqrs.query.add(query1Name, query1Function);
            defaultCqrs.query.add(query2Name, query2Function);
            expect(defaultQueries.length).toBe(1);
            expect(defaultQueries[0].owner).toBe(defaultOwner);
            expect(defaultQueries[0].namespace).toBe(defaultNamespace);
            expect(defaultQueries[0].queryName).toBe(query1Name);
            expect(defaultQueries[0].queryFunction).toBe(query1Function);
        });

    });
});
