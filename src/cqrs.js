(function(global) {
    var handlersRepo = [],
        listenersRepo = [],
        aggregatesRepo = [],
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
        var commands = handlersRepo.filter(function (e) {
            return e.owner === owner;
        });
        commands.forEach(function (e) {
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
        var listeners = listenersRepo.filter(function (e) {
            return e.owner === owner;
        });
        listener.forEach(function (e) {
            listenersRepo.splice(e, 1);
        });
    }

    function listListeners(eventName) {
        return listenersRepo.filter(function (e) {
            return e.eventName === eventName;
        });
    }

    // aggregates listeners' repo functions
    function addAggregateListener(owner, aggregateName, eventName, callback) {
        var aggregates = aggregatesRepo.filter(function (e) {
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

    function removeAggregateListener(owner) {
        var aggregates = aggregatesRepo.filter(function (e) {
            return e.owner === owner;
        });
        aggregates.forEach(function (e) {
            aggregatesRepo.splice(e, 1);
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
        cqrsCb = callback;
        params = typeof callback === 'function' ? params : callback;
        owner = (params && params.owner) || ('owner-' + (counter++));
        namespace = params && params.namespace;

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
                    resolve(handler.callback(payload, metadata));
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
                    return publish(eventName, payload, metadata);
                });
            }
            exports.apply = apply;

            function aggregateHandlerWrapper(payload, metadata) {
                return callback(payload, metadata, apply);
            }

            // to handle a command from an aggregate
            function aggregateHandler(commandName, callback) {
                handle(commandName, aggregateHandlerWrapper);
                return exports;
            }
            exports.handle = aggregateHandler;

            // to listen an event from an aggregate
            function aggregateListener(eventName, callback) {
                var evtName = generateTechnicalName(namespace, 'evt', eventName);
                if (cqrs.debug) {
                    console.log('cqrs - aggregate listener - add listener %s:%s:%s', owner, aggName, evtName);
                }
                addAggregateListener(owner, aggName, evtName, callback)
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
        }
        exports.destroy = destroy;

        return exports;
    }

    function setDefaultRepos(defaultHandlers, defaultListeners, defaultAggregates) {
        handlersRepo = defaultHandlers;
        listenersRepo = defaultListeners;
        aggregatesRepo = defaultAggregates;
    };
    cqrs.setDefaultRepos = setDefaultRepos;

    global.cqrs = cqrs;
}(this));
