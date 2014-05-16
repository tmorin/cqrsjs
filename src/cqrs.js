(function(global) {
    var handlersRepo = [], listenersRepo = [], aggregatesRepo = [], counter = 0;

    // handlers' repo functions
    function addHandler(owner, commandName, callback) {
    }

    function removeHandlers(owner) {
    }

    function getHandler(commandName) {
    }

    // listeners' repo functions
    function addListener(owner, eventName, callback) {
    }

    function removeListeners(owner) {
    }

    function listListeners(eventName) {
    }

    // aggregates listeners' repo functions
    function addAggregateListener(owner, aggregateName, eventName, callback) {
    }

    function removeAggregateListener(owner) {
    }

    function listAggregateListeners(aggregateName) {
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
            var cmdName = generateTechnicalName(namespace, 'cmd', commandName);
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
            var evtName = generateTechnicalName(namespace, 'evt', commandName);
        }
        exports.publish = publish;

        // to register an aggregate
        function aggregate(aggregateName, payload, metadata) {
            var aggName = generateTechnicalName(namespace, 'agg', commandName);

            // to publish an event from an aggregate
            function apply(eventName, payload, metadata) {
                var evtName = generateTechnicalName(namespace, 'evt', commandName);
            }

            // to handle a command from an aggregate
            function aggregateHandler(commandName, callback) {
                var cmdName = generateTechnicalName(namespace, 'cmd', commandName);
            }

            // to listen an event from an aggregate
            function aggregateListener(eventName, callback) {
                var evtName = generateTechnicalName(namespace, 'evt', commandName);
            }

            return {
                handle: aggregateHandler,
                listen: aggregateListener
            };
        }
        exports.aggregate = aggregate;

        // to safely destroy the cqrs instance
        function destroy() {
        }
        exports.destroy = destroy;

        return exports;
    }

    return cqrs;
}(this));