cqrsjs
======

CQRS pattern application for javascript.

cqrsjs is designed to work for the browser and nodejs too.

h2. Requirements

cqrsjs used the es6 Promise.
So use a polyfill if th targetted runtime doesn't provide a native implementation.

Unless es5 features, specially Array's methods are required.

h2. cq what?

h2. All in one function

cqrsjs provides only one function, cqrs(callback, params).
Both, callback and params are optionals.

```
// when callback and params are defined
var instance1 = cqrs(callback, params);

// when only callback is defined
var instance2 = cqrs(callback);

// when only params is defined
var instance3 = cqrs(params);

// when callback and params are omitted
var instance4 = cqrs();
```

Each invokation of cqrs() returns a unique instance.
So instance1, instance2, instance3, instance4 are different.
Each instance has an id, also called owner.
So that, each action done beyong the returns instance will be linked to the owner value.
The owner value is by default automaticaly generated.
However the consumer can provide its owner id beyong the params argument.
Owner value can not be shared between instances.

```
cqrs({
    owner: 'myCqrsInstance'
}); // -> return an instance having the owner value myCqrsInstance

h2. Send a command

```
// using the fluent API
cqrs().send('command1', payload, metadata);
// -> return a promise, resolved or not according to the handler implementation
```

```
// using the callback API
cqrs(function (send, handle, publish, listen, aggregate, queries) {
    send('command1', payload, metadata);
    // -> return a promise, resolved or not according to the handler implementation
}); // -> return the current cqrs instance
```

h2. Handle a command

```
// using the fluent API
cqrs().handle('command1', function(payload, metadata, queries) {
    // do some stuff with payload and metadata
    // can return a promise
}); // -> return the current cqrs instance
```

```
// using the callback API
cqrs(function (send, handle, publish, listen, aggregate, queries) {
    handle('command1', function(payload, metadata, queries) {
        // do some stuff with payload and metadata
        // can return a promise
    }); // -> return the current cqrs instance
}); // -> return the current cqrs instance
```

h2. Publish an event

```
// using the fluent API
cqrs().publish('event1', payload, metadata);
// -> return a promise, resolved or not according to the listeners implementation
```

```
// using the callback API
cqrs(function (send, handle, publish, listen, aggregate, queries) {
    publish('event1', payload, metadata);
    // -> return a promise, resolved or not according to the listeners implementation
}); // -> return the current cqrs instance
```

h2. Listen an event

```
// using the fluent API
cqrs().listen('event1', function(payload, metadata) {
    // do some stuff with payload and metadata
    // can return a promise
}); // -> return the current cqrs instance
```

```
// using the callback API
cqrs(function (send, handle, publish, listen, aggregate, queries) {
    listen('event1', function(payload, metadata) {
        // do some stuff with payload and metadata
        // can return a promise
    }); // -> return the current cqrs instance
}); // -> return the current cqrs instance
```

h2. Work with aggregates

h3. Handle a command

```
// using the fluent API
cqrs().aggregate('aggregate1').handle('command1', function(payload, metadata, queries, apply) {
    // do some stuff with payload and metadata
    // can return a promise
}) // -> return the current aggregate instance
```

```
// using the callback API
cqrs(function (send, handle, publish, listen, aggregate, queries) {
    aggregate('aggregate1', function (handle, listen) {
        handle('command1', function(payload, metadata, queries, apply) {
            // do some stuff with payload and metadata
            // can return a promise
        }); // -> return the current aggregate instance
    }); // -> return the current aggregate instance
}); // -> return the current cqrs instance
```

h3. Listen a aggregate events

```
// using the fluent API
cqrs().aggregate('aggregate1').listen('event1', function(payload, metadata) {
    // do some stuff with payload and metadata
    // can return a promise
}) // -> return the current aggregate instance
```

```
// using the callback API
cqrs(function (send, handle, publish, listen, aggregate, queries) {
    aggregate('aggregate1', function (handle, listen) {
        listen('command1', function(payload, metadata) {
            // do some stuff with payload and metadata
            // can return a promise
        }); // -> return the current aggregate instance
    }); // -> return the current aggregate instance
}); // -> return the current cqrs instance
```

h2. Provide queries

```
// using the fluent API
cqrs().queries.add('queryName', function() {
    // do some stuff with YOUR arguments
    // can return a promise
}) // -> return the current cqrs instance
```

```
// using the callback API
cqrs(function (send, handle, publish, listen, aggregate, queries) {
    queries.add('queryName', function() {
        // do some stuff with YOUR arguments
        // can return a promise
    }); // -> return the current cqrs instance
}); // -> return the current cqrs instance
```

h2. Consume queries

```
// using the fluent API
cqrs().queries().queryName(arg1, arg2 /* whatever */); // -> return a promise
```

```
// using the callback API
cqrs(function (send, handle, publish, listen, aggregate, queries) {
    queries().queryName(arg1, arg2 /* whatever */); // -> return a promise
}); // -> return the current cqrs instance
```

h2. Memory leaks and destruction

Each cqrs instance can be destoyed on demand calling the destroy method.
The destroy method will removed the follwing stuff created using the cqrs instance:
- command handlers
- event listeners
- aggregate event listeners
- queries

```
// let's create two cqrs instance
var cqrsInstance1 = cqrs();
var cqrsInstance2 = cqrs();

// do some stuff with them

// destroy the first one
cqrsInstance1.destroy();

// all handlers, listeners, aggregate listeners and queries created beyong
// cqrsInstance1 are now no longer available
```

h2. Promise flow

Keep min two things:
- the functions send, publish and apply return always a promise
- the callbacks of handlers, listeners and aggregate listeners are alwas wrapped arround a promise

That means, cqrsjs is able to handle asynchonous execution

GIVEN the aggregate aggregate1 handling the command1
AND the aggregate aggregate1 listenning the event1
GIVEN the component component1 able to send the command1
GIVEN the component component2 listenning the event1
GIVEN the component component3 listenning the event1
WHEN component1 send the command1
THEN the aggregate1's handler will process the command
THEN the aggregate1's handler will apply the event1
WHEN event is applied
THEN the aggregate1's listener will process the event1
AND the aggregate1's listener will return a promise
WHEN the promise is resolved
THEN the compoent2's listener will process the event1
AND the compoent3's listener will process the event1
THEN all listener's promise are fullfiled
THEN the promise of the component1's send invokation is fullfiled

In this scenario the component1 could be able to know if the command processing has be successfully done to the last step or not.



The functions send, publish and apply will always return promises.
The promise flow are in function of the handlers and listeners implementation.

Basically, according to the business, the context or whatever, the feedback about a command completion can be different.

With cqrsjs you can handle theses three cases:

The validation step
We just want to know the command is valid and will be processed.
We don't care if the processing will success or not.

The validation and trandaction steps
We want to know more than just the validation purpose.
We want to know if the transaction (aggregate listeners step) has been processed successfully or not.
But we don't want to know if the other listeners invokation succed or not.

The validation, the trandaction and the dispatch steps
We want to know if all the chain success or not.


```

```
