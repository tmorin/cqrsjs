(function(global) {
    var handlersRepo = [], listenersRepo = [], aggregatesRepo = [], counter = 0;

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
        eventsRepo.push({
            owner: owner,
            eventName: eventName,
            callback: callback
        });
    }

    function removeListeners(owner) {
        var events = eventsRepo.filter(function (e) {
            return e.owner === owner;
        });
        events.forEach(function (e) {
            eventsRepo.splice(e, 1);
        });
    }

    function listListeners(eventName) {
        return eventsRepo.filter(function (e) {
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
                aggregateName: aggregateName
                listeners: []
            };
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

    function listAggregateListeners(aggregateName) {
        return aggregatesRepo.filter(function (e) {
            return e.aggregateName === aggregateName;
        }).map(function (e) {
            return e.listeners;
        }).reduce(function (a, b) {
            return a.concate(b)
        }, []);
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
        owner = (params && params.owner) || ('owner-' + (counter++));
        namespace = params && params.namespace;

        // to handle a command
        function handle(commandName, callback) {
            var cmdName = generateTechnicalName(namespace, 'cmd', commandName);
            if (!getHandler(cmdName)) {
                addHandler(owner, cmdName, callback);
            }
            return exports;
        }
        exports.handle = handle;

        // to send a command
        function send(commandName, payload, metadata) {
            return new Promise(function (resolve, reject) {
                var cmdName = generateTechnicalName(namespace, 'cmd', commandName);

            });
        }
        exports.send = send;

        // to listen an event
        function listen(eventName, callback) {
            var evtName = generateTechnicalName(namespace, 'evt', commandName);
            addListener(owner, evtName, callback);
            return exports;
        }
        exports.listen = listen;

        // to publish an event
        function publish(eventName, payload, metadata) {
            return new Promise(function (resolve, reject) {
                var evtName = generateTechnicalName(namespace, 'evt', commandName);
            });
        }
        exports.publish = publish;

        // to register an aggregate
        function aggregate(aggregateName, payload, metadata) {
            var aggName = generateTechnicalName(namespace, 'agg', commandName);
            var exports = {};

            // to publish an event from an aggregate
            function apply(eventName, payload, metadata) {
                return new Promise(function (resolve, reject) {
                    var evtName = generateTechnicalName(namespace, 'evt', commandName);
                });
            }

            // to handle a command from an aggregate
            function aggregateHandler(commandName, callback) {
                var cmdName = generateTechnicalName(namespace, 'cmd', commandName);

            }
            exports.handle = aggregateHandler;

            // to listen an event from an aggregate
            function aggregateListener(eventName, callback) {
                var evtName = generateTechnicalName(namespace, 'evt', commandName);
            }
            exports.listen = aggregateListener;

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
