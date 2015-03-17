# Play with cqrsjs

## All in one function

cqrsjs provides only one function, `cqrs()`.

```
var instance2 = cqrs();

```

Each invokation of `cqrs()` returns a unique instance.
So instance1 and instance2 are different.

### Owner

Each instance has an id, also called owner.
So that, each actions done from the returned instance will be linked to the owner value.
It's mandatory for debugging and obviously for prevent memory leak.

The owner value is by default automatically generated.
However the consumer can provide its owner id from the params argument.

The owner value must not be shared between instances.

```
var foo = cqrs({
    owner: 'myCqrsInstance'
});
```

### Namespace

A namespace can also be given as parameter.
A namespace can be shared between several cqrs instances.

When a command is sent from a cqrs instance which is attached to the namespace _foo_,
only handlers declared from cqrs instances attached to the namespace _foo_ will be invoked.

It's the same mechanism for event, aggregate and queries.

```
var bar = cqrs({
    namespace: 'myNamespace'
});
```

## Memory leaks and destruction

Each cqrs instance can be destroyed on demand calling the `destroy` method.
The `destroy` method will removed the following stuff created using the cqrs instance:
- command handlers
- event listeners
- aggregate event listeners
- queries

That means, you can call the following methods of cqrs without taking care of its destruction:
- send
- publish
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

Keep in mind two things:
- the functions send, publish, apply and queries return always a promise
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

According to the implementation of the callback, all stuff done during the chain can be _handled_.
