[![Build Status](https://travis-ci.org/tmorin/cqrsjs.svg?branch=master)](https://travis-ci.org/tmorin/cqrsjs)

cqrsjs
======

CQRS pattern application for JavaScript.

cqrsjs is designed to work for the browser and nodejs too.

## Requirements

cqrsjs used the es6 Promise.
So use a polyfill if the targeted runtime doesn't provide a native implementation.

cqrsjs is built around the es5 features.

So it should work for nodejs, evergreen browsers, IE9 and IE10.

If not ... it's a bug.

## cq what?

cqrs means Command and Query Responsibility Segregation.
It's coming from far. So wikipedia will be better place to know more about it.

## All in one function

cqrsjs provides only one function, cqrs(callback, params).
Both, callback and params are optional.

```
// when callback and params are given
var instance1 = cqrs(callback, params);

// when only callback is given
var instance2 = cqrs(callback);

// when only params is given
var instance3 = cqrs(params);

// when callback and params are omitted
var instance4 = cqrs();
```

Each invokation of cqrs() returns a unique instance.
So instance1, instance2, instance3, instance4 are different.

Each instance has an id, also called owner.
So that, each actions done from the returned instance will be linked to the owner value.
It's mandatory for debugging and memory leak management.

The owner value is by default automatically generated.
However the consumer can provide its owner id from the params argument.

Owner value must not be shared between instances.

```
var foo = cqrs({
    owner: 'myCqrsInstance'
}); // -> return an instance having the owner value myCqrsInstance
```

A namespace can also be given as parameter.
A namespace can be shared between several cqrs instances.
When a command is sent from a cqrs instance attached to the namespace foo,
only handlers declared from cqrs instances attached to the namespace foo will be invoked.
It's the same mechanism for event, aggregate and queries.

```
var bar = cqrs({
    namespace: 'myNamespace'
}); // -> return an instance attached to the namespace myNamespace
// The instances foo and bar are unable to communicate together.
```

## Send a command

```
// using the linked API
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
// using the linked API
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
// using the linked API
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
// using the linked API
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

Aggregate can be see as a transactional space.
Things done into an aggregate can be committed or rollbacked.
The same aggregate can be enhanced by several cqrs instances.

The following paragraphs take as example an application called shoplist.
The shoplist application list items to buy.
When the user bought an item, the item can be marked as bought.
For each item there is a quantity.
So, the list cool be something like that:
- buy tomatoes for the quantity of 3 (kg),
- buy milk for the quantity of 2 (bottles)
- etc.

The main business rule say: you can not have two lines having the same item's label.

For the UI parts, the user expects suggestions when he's typing an item's label to add.
Obviously, the suggestions can not contain items already present into the list.
But the suggestion must contain items already present in the past into a previous list.

Basically, shoplist work with two aggregates, one for the items, the other one for the suggestions.

The main commands will be:
- addItem
    - payload: the item's label and the desired quantity
    - applied event: itemAdded
- markItemBought
    - payload: the item's identifier
    - applied event: itemMarkedBought

The role of the command addItem is to be sure that the given item's label is not yet into the list.
To do that, the command has to consume a query: isItemLabelNotIntoTheList.
If the item is not into the list, the event itemAdded is applied.

The role of the command markItemBought is to be sure that the given item is not yet bought.
To do that, the command has to consume a query: isItemNotBought.
If the item is not yet bought, the event itemMarkedBought is applied.

The event itemAdded and itemMarkedBought are applied, but not published by the command handlers.
It's a big different, that means aggregate listeners listening these events will be invoked first.
The external listeners listening these events will be invoked only if the aggregate listeners invokation are successful.
In the case where the event is published instead of applied, the aggregate listeners will be skipped.
That means, the implementation of the command handlers have to be attached to the targeted aggregates.
In our case, the targeted aggregate of the commands addItem and markItemBought is items.

Because, the aggregate listeners are invoked before the externals.
And because the invokations of the externals are done according to the success of the aggregate listeners invokations.
The implementation of the persistence should be done into these aggregate listeners.
Moreover, about roll backing, it should be have only one aggregate listener by applied event.

The implementation of the command handlers and aggregate listeners can be done like this:

```
cqrs().aggregate('items')
    .handle('addItem', function(payload, metadata, queries, apply) {
        return queries().isItemLabelNotIntoTheList(payload.label).then(function () {
            return apply('itemAdded' payload, metadata),
        });
    });
    .listen('itemAdded', function(payload, metadata, queries, apply) {
        // persist data
        // return promise if needed
    });
cqrs().aggregate('items')
    .handle('markItemBought', function(payload, metadata, queries, apply) {
        return queries().isItemLabelNotIntoTheList(payload.label).then(function () {
            return apply('itemAdded' payload, metadata),
        });
    });
    .listen('itemMarkedBought', function(payload, metadata, queries, apply) {
        // persist data
        // return promise if needed
    });
```

About the suggestions aggregate, the main command will be:
- addSuggestion
    - payload: the suggestion to add into the suggestion list
    - applied event: suggestionAdded

The role of the command addSuggestion is to be sure that the given suggestion is not yet into the list.
To do that, the command has to consume a query: isSuggestionNotIntoTheList.
If the suggestion is not into the list, the event suggestionAdded is applied.

```
cqrs().aggregate('suggestions')
    .handle('addSuggestion', function(payload, metadata, queries, apply) {
        return queries().isSuggestionNotIntoTheList(payload).then(function () {
            return apply('suggestionAdded' payload, metadata),
        });
    });
    .listen('suggestionAdded', function(payload, metadata, queries, apply) {
        // persist data
        // return promise if needed
    });
```

When an item is added into the list, the command addSuggestion should be sent.
So, a component as to be defined in order to send the addSuggestion when the event itemAdded is published.

```
cqrs(function (send, handle, publish, listen, aggregate, queries) {
    listen('suggestionAdded', function(payload, metadata, queries), function () {
        send('addSuggestion', payload.label, metadata).catch(function (error) {
            // error handling
        });
    })
});
```

Others components should be created in order to handle the UI parts.
The first one should append the added item and mark item bought.
The second one to update the auto-complete widget.

### Handle a command

```
// using the linked API
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
// using the linked API
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
// using the linked API
cqrs().queries('queryName', function() {
    // do some stuff with YOUR arguments
    // can return a promise
}) // -> return the current cqrs instance
```

```
// using the callback API
cqrs(function (send, handle, publish, listen, aggregate, queries) {
    queries('queryName', function() {
        // do some stuff with YOUR arguments
        // can return a promise
    }); // -> return the current cqrs instance
}); // -> return the current cqrs instance
```

## Consume queries

```
// using the linked API
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

That means, you can call the following methods of cqrs without taking care of its destruction:
- send
- publish
- queries.*

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

Keep in mind two things:
- the functions send, publish, apply and queries.* return always a promise
- the callbacks of handlers, listeners, aggregate listeners and queries are always wrapped around a promise

The returned value of the callback is the resolved value of the wrapped promise.

- GIVEN the aggregate aggregate1 handling the command1
- AND the aggregate aggregate1 listening the event1
- GIVEN the component component1 able to send the command1
- GIVEN the component component2 listening the event1
- GIVEN the component component3 listening the event1
- WHEN component1 send the command1
- THEN the aggregate1's handler will process the command
- THEN the aggregate1's handler will apply the event1
- WHEN event is applied
- THEN the aggregate1's listener will process the event1
- AND the aggregate1's listener will return a promise
- WHEN the promise is resolved
- THEN the compoent2's listener will process the event1
- AND the compoent3's listener will process the event1
- WHEN all listener's promise are fulfilled
- THEN the promise of the component1's send invokation is fulfilled

In this scenario the component1 could be able to know if the command has been successfully processed or not.

According to the implementation of the callback, all stuff done during the chain can be 'handled'.
