# Play with queries

## Call queries

Queries are called from `cqrs().call()`.
Where `call` take the name of the query and arguments requried by the query implementation.

```
cqrs().call('query1', 'arg1', 'arg2').then(function (result) {
    // do some stuff with the query result
});
```

## Register queries

Queries are registered from `cqrs().calling().invoke()`.
Where `calling` takes the name of the query as parameter and `invoke` the callback.

The callback has the arguments given when `cqrs().call()` is called.

```
cqrs().calling('query1').invoke(function (arg1, arg1) {
    // do some stuff with arg1 and arg2
    // can return a promise
});
```