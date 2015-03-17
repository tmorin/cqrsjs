# Play with events

## Publish events

Events are published from `cqrs().publish()`.
Where `publish` take the payload and the metadata as arguments.
Both are optionals.

```
cqrs().publish('eventName', payload, metdata);
```

## Listen events

Events are listened from `cqrs().on().invoke()`.
Where `on` takes the name of the event as parameter and `invoke` the callback.

The callback has two arguments:
- the payload, it can be null
- the metadata, it will be never null

```
cqrs().on('eventName').invoke(function (payload, metadata) {
    // do some stuff with payload and metadata
    // can return a promise
});
```
