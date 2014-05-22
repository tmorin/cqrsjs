(function(global) {
    var handlersRepo = [],
        listenersRepo = [],
        aggregatesRepo = [],
        queriesRepo = [],
        counter = 0;

    // handlers' repo functions
    function addHandler(owner, commandName, callback) {
        var alreadyRegistered = handlersRepo.some(function (e) {
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
        handlersRepo.filter(function (e) {
            return e.owner === owner;
        }).forEach(function (e) {
            handlersRepo.splice(e, 1);
        });
    }

    function getHandler(commandName) {
        var commands = handlersRepo.filter(function (e) {
            return e.commandName === commandName;
        });
        if (commands.length > 0) {
            return commands[0];
        }
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
        listenersRepo.filter(function (e) {
            return e.owner === owner;
        }).forEach(function (e) {
            var index = listenersRepo.indexOf(e);
            listenersRepo.splice(index, 1);
        });
    }

    function listListeners(eventName) {
        return listenersRepo.filter(function (e) {
            return e.eventName === eventName;
        });
    }

    // aggregates listeners' repo functions
    function addAggregateListener(owner, aggregateName, eventName, callback) {
        var aggregate, aggregates = aggregatesRepo.filter(function (e) {
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
        aggregatesRepo.filter(function (e) {
            return e.owner === owner;
        }).forEach(function (e) {
            var index = aggregatesRepo.indexOf(e);
            aggregatesRepo.splice(index, 1);
        });
    }

    function listAggregateListeners(aggregateName, eventName) {
        return aggregatesRepo.filter(function (e) {
            //console.log('listAggregateListeners filter', e.aggregateName, aggregateName);
            return e.aggregateName === aggregateName;
        }).map(function (e) {
            //console.log('listAggregateListeners map', e);
            return e.listeners;
        }).reduce(function (a, b) {
            //console.log('listAggregateListeners reduce', a, b);
            return a.concat(b);
        }, []).filter(function (l) {
            //console.log('listAggregateListeners filter', l, l.eventName, eventName);
            return l.eventName === eventName;
        });
    }

    // queries' repo functions
    function addQuery(owner, namespace, queryName, queryFunction) {
        var isAlreadyRegistered = queriesRepo.filter(function (query) {
            return query.namespace === namespace && query.queryName === queryName;
        }).length > 0;
        if (!isAlreadyRegistered) {
            queriesRepo.push({
                owner: owner,
                namespace: namespace,
                queryName: queryName,
                queryFunction: queryFunction
            });
        }
    }

    function removeQuery(owner) {
        queriesRepo.filter(function (e) {
            return e.owner === owner;
        }).forEach(function (e) {
            var index = queriesRepo.indexOf(e);
            queriesRepo.splice(index, 1);
        });
    }

    function listQueries(namespace) {
        return queriesRepo.filter(function (e) {
            return e.namespace === namespace;
        });
    }

    // generate technical name for aggregate, command and event
    function generateTechnicalName(namespace, type, name) {
        if (namespace) {
            return [namespace, type, name].join('-');
        }
        return [type, name].join('-');
    }

    // cqrs implementation
    function cqrs(callback, params) {
        var cqrsCb, owner, namespace, exports;
        exports = {};
        cqrsCb = typeof callback === 'function' && callback;
        params = typeof callback === 'function' ? params : callback;
        owner = (params && params.owner) || ('owner-' + (counter++));
        namespace = params && params.namespace;

        function queryWrapper(queryFunction) {
            return function () {
                var args = Array.prototype.slice.call(arguments);
                return new Promise(function (resolve, reject) {
                    try {
                        var result = queryFunction.apply(queryFunction, args);
                        resolve(result);
                    } catch (e) {
                        reject(e);
                    }
                });
            };
        }

        function query() {
            var queries = {};
            listQueries(namespace).forEach(function (e) {
                queries[e.queryName] = queryWrapper(e.queryFunction);
            });
            return queries;
        }
        exports.query = query;

        query.add = function add(queryName, queryFunction) {
            if (cqrs.debug) {
                console.log('cqrs - add query %s:%s:%s', owner, namespace, queryName);
            }
            addQuery(owner, namespace, queryName, queryFunction);
        };

        // to handle a command
        function handle(commandName, callback) {
            var cmdName = generateTechnicalName(namespace, 'cmd', commandName);
            if (!getHandler(cmdName)) {
                if (cqrs.debug) {
                    console.log('cqrs - handle - add handler %s:%s', owner, cmdName);
                }
                addHandler(owner, cmdName, callback);
            }
            return exports;
        }
        exports.handle = handle;

        // to send a command
        function send(commandName, payload, metadata) {
            return new Promise(function (resolve, reject) {
                var cmdName = generateTechnicalName(namespace, 'cmd', commandName);
                var handler = getHandler(cmdName);
                if (handler) {
                    if (cqrs.debug) {
                        console.log('cqrs - send - send command %s %o %o', cmdName, payload, metadata);
                    }
                    resolve(handler.callback(payload, metadata, query));
                } else {
                    reject(new Error('unable to found an handler'));
                }
            });
        }
        exports.send = send;

        // to listen an event
        function listen(eventName, callback) {
            var evtName = generateTechnicalName(namespace, 'evt', eventName);
            if (cqrs.debug) {
                console.log('cqrs - listen - add listener %s:%s', owner, evtName);
            }
            addListener(owner, evtName, callback);
            return exports;
        }
        exports.listen = listen;

        // to publish an event
        function publish(eventName, payload, metadata) {
            var evtName = generateTechnicalName(namespace, 'evt', eventName);
            if (cqrs.debug) {
                console.log('cqrs - publish - publish event %s %o %o', evtName, payload, metadata);
            }
            var listeners = listListeners(evtName);
            var promises = listeners.map(function(listener) {
                return new Promise(function (resolve, reject) {
                    try {
                        var result = listener.callback(payload, metadata);
                        resolve(result);
                    } catch (e) {
                        reject(e);
                    }
                });
            });
            return Promise.all(promises);
        }
        exports.publish = publish;

        // to register an aggregate
        function aggregate(aggregateName, callback) {
            var aggName = generateTechnicalName(namespace, 'agg', aggregateName);
            var exports = {};

            // to publish an event from an aggregate
            function apply(eventName, payload, metadata) {
                var evtName = generateTechnicalName(namespace, 'evt', eventName);
                if (cqrs.debug) {
                    console.log('cqrs - aggregate apply - %s:%s:%s', owner, aggName, evtName);
                }
                var promises = listAggregateListeners(aggName, evtName).map(function (listener) {
                    return new Promise(function (resolve, reject) {
                        try {
                            var result = listener.callback(payload, metadata);
                            resolve(result);
                        } catch (e) {
                            reject(e);
                        }
                    });
                });
                return Promise.all(promises).then(function () {
                    console.log('debug inside');
                    var result = publish(eventName, payload, metadata);
                    console.log('debug', result);
                    return result;
                }).then(null , function (error) {
                    console.log('debug error', error)
                    return Promise.reject(error);
                });
            }
            exports.apply = apply;

            function aggregateHandlerWrapper(callback) {
                return function (payload, metadata, query) {
                    callback(payload, metadata, query, apply)
                };
            }

            // to handle a command from an aggregate
            function aggregateHandler(commandName, callback) {
                handle(commandName, aggregateHandlerWrapper(callback));
                return exports;
            }
            exports.handle = aggregateHandler;

            // to listen an event from an aggregate
            function aggregateListener(eventName, callback) {
                var evtName = generateTechnicalName(namespace, 'evt', eventName);
                if (cqrs.debug) {
                    console.log('cqrs - aggregate listener - add listener %s:%s:%s', owner, aggName, evtName);
                }
                addAggregateListener(owner, aggName, evtName, callback);
            }
            exports.listen = aggregateListener;

            if (callback) {
                callback(aggregateHandler, aggregateListener);
            }

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

        if (cqrsCb) {
            cqrsCb(send, handle, publish, listen, aggregate, query);
        }

        return exports;
    }

    function setDefaultRepos(defaultHandlers, defaultListeners, defaultAggregates, defaultQueries) {
        handlersRepo = defaultHandlers;
        listenersRepo = defaultListeners;
        aggregatesRepo = defaultAggregates;
        queriesRepo = defaultQueries;
    }
    cqrs.setDefaultRepos = setDefaultRepos;

    global.cqrs = cqrs;
}(this));
