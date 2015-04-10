# Play with aggregates

Aggregate can be see as a transactional space.
Things done into an aggregate can be committed or rollbacked.
The same aggregate can be enhanced by several cqrs instances.

## Get an aggregate instance

```
var aggregateInstance = cqrs().aggregate('aggregateName');
```

## Handle commands

```
aggregateInstance.when('commandName')
    .invoke(function (payload, command) {
        // handle the command
        // return a payload event if you want to apply the linked event
    })
    .apply('eventName', 'anotherEventName');
```

```
aggregateInstance.when('commandName')
    .invoke(function (payload, command) {
        // handle the command
        // return an array of payload event
    })
    .forEach() // for each payload event
    .apply('eventName', 'anotherEventName'); // apply the following events
```

## Handle events

```
aggregateInstance.when('eventName')
    .invoke(function (payload, command) {
        // handle the command
        // return a payload event if you want to apply the linked event
    })
    .apply('eventName', 'anotherEventName');
```

## Listen a aggregate events

```
aggregateInstance.on('eventName')
    .invoke(function (payload, command) {
        // handle the event
    });
aggregateInstance.on('anotherEventName')
    .invoke(function (payload, command) {
        // handle the event
    });
```

## Use case

The following paragraphs take as example an application called shoplist.
The shoplist application list items to buy.
When the user bought an item, the item can be marked as bought.
For each item there is a quantity.
So, the list cool be something like that:
- buy tomatoes for the quantity of 3 (kg),
- buy milk for the quantity of 2 (bottles)
- etc.

The main business rule say: you can not have two lines having the same item's label.

From the UI parts, the user expects suggestions when he's typing an item's label to add.
Obviously, the suggestions can not contain items already present into the list.
But the suggestions list is built from the history already bought items.

Basically, shoplist works with two aggregates, one for the items, the other one for the suggestions.

The main commands will be:
- addItem
 - payload: the item's label and the desired quantity
 - applied event: itemAdded
- markItemBought
 - payload: the item's identifier
 - applied event: itemMarkedBought

The role of the command _addItem_ is to be sure that the given item's label is not yet into the list.
To do that, the command has to consume a query: _isItemLabelNotIntoTheList_.
If the item is not into the list, the event _itemAdded_ is applied.

The role of the command _markItemBought_ is to be sure that the given item is not yet bought.
To do that, the command has to consume a query: _isItemNotBought_.
If the item is not yet bought, the event _itemMarkedBought_ is applied.

The event _itemAdded_ and _itemMarkedBought_ are applied, but not published by the command handlers.
It's a big different, that means aggregate listeners listening these events will be invoked first.
The external listeners listening these events will be invoked only if the aggregate listeners invokation are successful.

In the case where the event is published instead of applied, the aggregate listeners will be skipped.
That means, the implementation of the command handlers have to be attached to the targeted aggregates.
In our case, the targeted aggregate of the commands _addItem_ and _markItemBought_ is _items_.

Because, the aggregate listeners are invoked before the externals.
And because the invokations of the externals are done according to the success of the aggregate listeners invokations.
The implementation of the persistence should be done into these aggregate listeners.
Moreover, about roll backing, it should be have only one aggregate listener by applied event.

The implementation of the command handlers and aggregate listeners can be done like this:

```
cqrs().aggregate('items')
    .when('addItem').invoke(function(payload, metadata) {
        return cqrs.call('isItemLabelNotIntoTheList', payload.label).then(function () {
            return payload;
        });
    }).apply('itemAdded')
    .on('itemAdded').invoke(function(payload, metadata) {
        // persist data
        // return promise if needed
    });
cqrs().aggregate('items')
    .when('markItemBought').apply(function(payload, metadata) {
        return cqrs.call('isItemNotBought', payload.label).then(function () {
            return payload,
        });
    }).apply('itemMarkedBought')
    .on('itemMarkedBought'.apply(function(payload, metadata) {
        // persist data
        // return promise if needed
    });
```

About the _suggestions_ aggregate, the main command will be:
- addSuggestion
    - payload: the suggestion to add into the suggestion list
    - applied event: suggestionAdded

The role of the command _addSuggestion_ is to be sure that the given suggestion is not yet into the list.
To do that, the command has to consume a query: _isSuggestionNotIntoTheList_.
If the suggestion is not into the list, the event _suggestionAdded_ is applied.

```
cqrs().aggregate('suggestions')
    .when('addSuggestion').invoke(function(payload, metadata) {
        return cqrs.call('isSuggestionNotIntoTheList', payload).then(function () {
            return payload;
        });
    }).apply('suggestionAdded')
    .on('suggestionAdded').invoke(function(payload, metadata) {
        // persist data
        // return promise if needed
    });
```

When an item is added into the list, the command _addSuggestion_ should be sent.
So, a component as to be defined in order to send the _addSuggestion_ when the event _itemAdded_ is published.

```
cqrs().on('itemAdded').invoke(function (payload, metadata) {
    cqrs.send('addSuggestion', payload.label, metadata).catch(function (error) {
        // handle error
    });
});
```

However, the code above could be done directly into the aggregate _suggestion_.

```
cqrs().aggregate('suggestions')
    .when('itemAdded').invoke(function (payload, metadata) {
        return cqrs.call('isSuggestionNotIntoTheList', payload.label).then(function () {
            return payload.label;
        });
    }).apply('suggestion-added);
```

Others components should be created in order to handle the UI parts.
The first one should append the added item and mark item bought.
The second one to update the auto-complete widget.
