/*
 * cqrs.js
 * Copyright 2014-2015 Thibault Morin
 * @license MIT
 */
(function(root, factory) {
    /* globals define:false */
    'use strict';
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define('cqrsjs', [], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory();
    } else {
        root.cqrs = factory();
    }
}(this, function() {
    'use strict';

    var handlersRepo = [], listenersRepo = [], aggregatesRepo = [], queriesRepo = [], counter = 0;

    function log() {
        /* istanbul ignore next */
        if (cqrs.debug) {
            console.log.apply(console, arguments);
        }
    }

    function whenify(value) {
        if (value && typeof value.then === 'function') {
            return value;
        }
        return new Promise(function (resolve) {
            resolve(value);
        });
    }

    // handlers' repo functions
    function addHandler(owner, commandName, callback) {
        var alreadyRegistered = handlersRepo.some(function(e) {
            return e.commandName === commandName;
        });
        if (!alreadyRegistered) {
            handlersRepo.push({
                owner: owner,
                commandName: commandName,
                callback: callback
            });
        }
    }

    function removeHandlers(owner) {
        handlersRepo.filter(function(e) {
            return e.owner === owner;
        }).forEach(function(e) {
            handlersRepo.splice(e, 1);
        });
    }

    function getHandler(commandName) {
        var commands = handlersRepo.filter(function(e) {
            return e.commandName === commandName;
        });
        if (commands.length > 0) {
            return commands[0];
        }
        throw new Error('unable to find the handler ' + commandName);
    }

    // listeners' repo functions
    function addListener(owner, eventName, callback) {
        listenersRepo.push({
            owner: owner,
            eventName: eventName,
            callback: callback
        });
    }

    function removeListeners(owner) {
        listenersRepo.filter(function(e) {
            return e.owner === owner;
        }).forEach(function(e) {
            var index = listenersRepo.indexOf(e);
            listenersRepo.splice(index, 1);
        });
    }

    function listListeners(eventName) {
        return listenersRepo.filter(function(e) {
            return e.eventName === eventName;
        });
    }

    // aggregates listeners' repo functions
    function addAggregateListener(owner, aggregateName, eventName, callback) {
        var aggregate, aggregates = aggregatesRepo.filter(function(e) {
            return e.owner === owner && e.aggregateName === aggregateName;
        });
        if (aggregates.length > 0) {
            aggregate = aggregates[0];
        } else {
            aggregate = {
                owner: owner,
                aggregateName: aggregateName,
                listeners: []
            };
            aggregatesRepo.push(aggregate);
        }
        aggregate.listeners.push({
            eventName: eventName,
            callback: callback
        });
    }

    function removeAggregateListeners(owner) {
        aggregatesRepo.filter(function(e) {
            return e.owner === owner;
        }).forEach(function(e) {
            var index = aggregatesRepo.indexOf(e);
            aggregatesRepo.splice(index, 1);
        });
    }

    function listAggregateListeners(aggregateName, eventName) {
        return aggregatesRepo.filter(function(e) {
            return e.aggregateName === aggregateName;
        }).map(function(e) {
            return e.listeners;
        }).reduce(function(a, b) {
            return a.concat(b);
        }, []).filter(function(l) {
            return l.eventName === eventName;
        });
    }

    // queries' repo functions
    function addQuery(owner, queryName, queryFunction) {
        var isAlreadyRegistered = queriesRepo.filter(function(query) {
            return query.queryName === queryName;
        }).length > 0;
        if (!isAlreadyRegistered) {
            queriesRepo.push({
                owner: owner,
                queryName: queryName,
                queryFunction: queryFunction
            });
        }
    }

    function removeQueries(owner) {
        queriesRepo.filter(function(e) {
            return e.owner === owner;
        }).forEach(function(e) {
            var index = queriesRepo.indexOf(e);
            queriesRepo.splice(index, 1);
        });
    }

    function getQuery(queryName) {
        var queries = queriesRepo.filter(function(e) {
            return e.queryName === queryName;
        });
        if (queries.length > 0) {
            return queries[0];
        }
        throw new Error('unable to find the query ' + queryName);
    }

    // generate technical name for aggregate, command and event
    function generateTechnicalName(namespace, type, name) {
        if (namespace) {
            return [namespace, type, name].join('-');
        }
        return [type, name].join('-');
    }

    // cqrs implementation
    function cqrs(params) {
        var owner, namespace, exports;
        exports = {};
        params = params || {};
        owner = params.owner || ('owner-' + (counter++));
        namespace = params.namespace;

        // to send a command
        function send(commandName, payload, metadata) {
            var cmdName = generateTechnicalName(namespace, 'cmd', commandName);
            return new Promise(function(resolve) {
                var handler = getHandler(cmdName);
                if (!metadata) {
                    metadata = {
                        sentOn: new Date()
                    };
                } else {
                    metadata.sentOn = new Date();
                }
                log('cqrs - send - send command %s %o %o', cmdName, payload, metadata);
                resolve(handler.callback(payload, metadata));
            });
        }
        exports.send = send;

        // to handle a command
        function when(commandName) {
            var exports = {};
            var cmdName = generateTechnicalName(namespace, 'cmd', commandName);

            function invoke(callback) {
                log('cqrs - when - add handler %s:%s', owner, cmdName);
                addHandler(owner, cmdName, callback);
            }
            exports.invoke = invoke;

            return exports;
        }
        exports.when = when;

        // to publish an event
        function publish(eventName, payload, metadata) {
            var evtName = generateTechnicalName(namespace, 'evt', eventName);
            var listeners = listListeners(evtName);
            if (!metadata) {
                metadata = {
                    publishedOn: new Date()
                };
            } else {
                metadata.publishedOn = new Date();
            }
            log('cqrs - publish - publish event %s %o %o', evtName, payload, metadata);
            var promises = listeners.map(function(listener) {
                return Promise.resolve().then(function() {
                    return listener.callback(payload, metadata);
                });
            });
            return Promise.all(promises);
        }
        exports.publish = publish;

        // to listen an event
        function on(eventName) {
            var exports = {};
            var evtName = generateTechnicalName(namespace, 'evt', eventName);

            function invoke(callback) {
                log('cqrs - on - add listener %s:%s', owner, evtName);
                addListener(owner, evtName, callback);
            }
            exports.invoke = invoke;

            return exports;
        }
        exports.on = on;

        // to register a query
        function calling(queryName) {
            var exports = {};
            var qryName = generateTechnicalName(namespace, 'qry', queryName);

            function invoke(queryFunction) {
                log('cqrs - calling - add query %s:%s', owner, qryName);
                addQuery(owner, qryName, queryFunction);
            }
            exports.invoke = invoke;

            return exports;
        }
        exports.calling = calling;

        // to call a query
        function call() {
            var args = Array.prototype.slice.call(arguments);
            var queryName = args.shift();
            var qryName = generateTechnicalName(namespace, 'qry', queryName);
            log('cqrs - call - call query %s:%s', owner, qryName);
            return Promise.resolve().then(function() {
                var query = getQuery(qryName);
                return query.queryFunction.apply(null, args);
            });
        }
        exports.call = call;

        // to register an aggregate
        function aggregate(aggregateName) {
            var exports = {};
            var aggName = generateTechnicalName(namespace, 'agg', aggregateName);

            // to handle a command from an aggregate
            function aggregateWhen(commandName) {
                var exports = {};
                var cmdName = generateTechnicalName(namespace, 'cmd', commandName);

                function invoke(callback) {
                    var invokeExports = {};
                    function apply(eventName) {
                        var evtName = generateTechnicalName(namespace, 'evt', eventName);
                        function callbackWrapper(payload, metadata) {
                            var callbackReturnedValue = callback(payload, metadata);
                            return whenify(callbackReturnedValue).then(function (eventPayload) {
                                if (eventName && eventPayload) {
                                    metadata.appliedOn = new Date();
                                    log('cqrs - aggregate apply - %s:%s:%s', owner, aggName, evtName);
                                    var promises = listAggregateListeners(aggName, evtName).map(function(listener) {
                                        return Promise.resolve().then(function () {
                                            return listener.callback(eventPayload, metadata);
                                        });
                                    });
                                    return Promise.all(promises).then(function() {
                                        return publish(eventName, eventPayload, metadata);
                                    });
                                }
                            });
                        }
                        log('cqrs - aggregate when - add handler %s:%s', owner, cmdName);
                        addHandler(owner, cmdName, callbackWrapper);
                        return exports;
                    }
                    invokeExports.apply = apply;
                    return invokeExports;
                }
                exports.invoke = invoke;

                return exports;
            }
            exports.when = aggregateWhen;

            // to listen an event from an aggregate
            function aggregateOn(eventName) {
                var aggregateOnExports = {};
                var evtName = generateTechnicalName(namespace, 'evt', eventName);

                function invoke(callback) {
                    log('cqrs - on - add listener %s:%s', owner, evtName);
                    addAggregateListener(owner, aggName, evtName, callback);
                    return exports;
                }
                aggregateOnExports.invoke = invoke;

                return aggregateOnExports;
            }
            exports.on = aggregateOn;

            return exports;
        }
        exports.aggregate = aggregate;

        // to safely destroy the cqrs instance
        function destroy() {
            removeHandlers(owner);
            removeListeners(owner);
            removeAggregateListeners(owner);
            removeQueries(owner);
        }
        exports.destroy = destroy;

        return exports;
    }

    function setDefaultRepos(defaultHandlers, defaultListeners, defaultAggregates, defaultQueries) {
        handlersRepo = defaultHandlers;
        listenersRepo = defaultListeners;
        aggregatesRepo = defaultAggregates;
        queriesRepo = defaultQueries;
    }
    cqrs.setDefaultRepos = setDefaultRepos;

    return cqrs;
}));
