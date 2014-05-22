cqrsjs
======

CQRS pattern application for JavaScript.

cqrsjs is designed to work for the browser and nodejs too.

## Requirements

cqrsjs used the es6 Promise.
So use a polyfill if the targeted runtime doesn't provide a native implementation.

Unless es5 features, specially Array's methods are required.

## cq what?

## All in one function

cqrsjs provides only one function, cqrs(callback, params).
Both, callback and params are optional.

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
So that, each action done from the returns instance will be linked to the owner value.
The owner value is by default automatically generated.
However the consumer can provide its owner id from the params argument.
Owner value can not be shared between instances.

```
cqrs({
    owner: 'myCqrsInstance'
}); // -> return an instance having the owner value myCqrsInstance
```

## Send a command

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

## Handle a command

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

## Publish an event

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

## Listen an event

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

## Work with aggregates

### Handle a command

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

### Listen a aggregate events

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

## Provide queries

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

## Consume queries

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

## Memory leaks and destruction

Each cqrs instance can be destroyed on demand calling the destroy method.
The destroy method will removed the following stuff created using the cqrs instance:
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

// all handlers, listeners, aggregate listeners and queries created from
// cqrsInstance1 are now no longer available
```

## Promise flow

Keep min two things:
- the functions send, publish and apply return always a promise
- the callbacks of handlers, listeners and aggregate listeners are always wrapped around a promise

The returned value of the callback is the resolved value of the wrapped promise.

GIVEN the aggregate aggregate1 handling the command1
AND the aggregate aggregate1 listening the event1
GIVEN the component component1 able to send the command1
GIVEN the component component2 listening the event1
GIVEN the component component3 listening the event1
WHEN component1 send the command1
THEN the aggregate1's handler will process the command
THEN the aggregate1's handler will apply the event1
WHEN event is applied
THEN the aggregate1's listener will process the event1
AND the aggregate1's listener will return a promise
WHEN the promise is resolved
THEN the compoent2's listener will process the event1
AND the compoent3's listener will process the event1
THEN all listener's promise are fulfilled
THEN the promise of the component1's send invokation is fulfilled

In this scenario the component1 could be able to know if the command processing has be successfully done to the last step or not.

According to the implementation of the callback, all stuff done during the chain can be 'handled'.
