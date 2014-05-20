cqrsjs
======

CQRS pattern apply to javascript.

h2. cq what?

h2. The cqrs function

h2. callback and fluent API

cqrsjs trys to provide a callback and a fluent API.

h3. callback and fluent API

```
// the pure callback API
cqrs(function (send, handle, publish, listen, aggregate) {

    handle('command1', function (payload, metadata) {
        // I am a command handler
        // I will be invoked when the command1 will be sent

        // I take decision or I do someting else

        // But at then end, I publish the event2
        return publish('event1', payload, metadata);
    });

    listen('event1', function (payload, metadata) {
        // I am an event listener
        // I will be invoked when the event1 will be published

        // I update views or something else

        // Then I send a command
        // Argggggg, it's possible but it's not a good practice
        // command should not be sent into listener or into an handler
        return send('command2', payload, metadata);
    });

    listen('event2', function (payload, metadata) {
        // I am an event listener
        // I will be invoked when the event2 will be published

        // I do some stuff, update some views
    });

    aggregate('aggregate1', function (handle, listen) {
        // I am a safe place for transactional processing

        handle('command2', function (payload, metadata, apply) {
            // I am a command handler
            // I will be invoked when the command1 will be sent

            // I'm taking decision

            // My decision is taken, I apply the event2
            // so that, aggregate listeners will be call first
            // other listeners will be invoked if aggregate listeners
            // have been invoked successfully
            return apply('event2', payload, metadata);
        });

        listen('event2', function (payload, metadata) {
            // I am an aggregate event listener
            // I will be invoked when the event2 will be applied

            // There it's a good place to persist the state of the aggregate
        });

        listen('event2', function (payload, metadata) {
            // I am an aggregate event listener
            // I will be invoked when the event2 will be applied

            // There it's not a good place to persist data
            // because we already do that into the previous listener
            // basicaly we can listen the same event into an aggregate
            // but it's not a good practice ...
        });

    });

});
```

h2. Send a command

h2. Handle a command

h2. Publish an event

h2. Listen an event

h2. Work with aggregates
