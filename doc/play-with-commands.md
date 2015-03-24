# Play with commands

## Send commands

Commands are sent from `cqrs().send()`.
Where `send` take the payload and the metadata as arguments.
Both are optionals.

```
cqrs().send('commandName', payload, metdata);
```

## Handle commands

Commands are handled from `cqrs().handle().invoke()`.
Where `handle` takes the name of the command as parameter and `invoke` the callback.

The callback has two arguments:
- the payload, it can be null
- the metadata, it will be never null

```
cqrs().when('commandName').invoke(function (payload, metadata) {
    // do some stuff with payload and metadata
    // can return a promise
});
```
