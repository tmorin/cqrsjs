(function(global){
    // items repositories

    var jsonRepo = JSON.stringify(global.defaultItems || []);

    function loadItems() {
        return JSON.parse(jsonRepo);
    }

    function storeItems(javascriptRepo) {
        jsonRepo = JSON.stringify(javascriptRepo);
    }

    function add(items) {
        var items = LocalStorage.getItem('cqrs-demo-repo-items');
        var addedItems = [];
        return Promise.resolve(addedItems);
    }

    function remove(ids) {
        var removedItems = [];
        return Promise.resolve(removedItems);
    }

    function update(items) {
        var updatedItems = [];
        return Promise.resolve(updatedItems);
    }

    function read(id) {
        var readItem = {};
        return Promise.resolve(readItem);
    }

    function list() {
        var listedItems = [];
        return Promise.resolve(listedItems);
    }

    global.itemsRepo = function (callback) {
        return callback(add, remove, update, read, list);
    };
}();

(function(global){
    var itemsRepo = global.itemsRepo;

    global.cqrs(function (send, handle, publish, listen, aggregate) {

        // the items aggregate
        aggregate('items', function (handle, listen) {
            handle('addItems', function (payload, metadata, apply) {
                return itemsRepo(function (add, remove, update, read, list) {
                    return add(payload).then(function (addedItems) {
                        return apply('itemsAdded', addedItems, metadata);
                    });
                });
            });

            handle('removeItems', function (payload, metadata, apply) {
                return itemsRepo(function (add, remove, update, read, list) {
                    return remove(payload).then(function (removedItems) {
                        return apply('itemsRemoved', removedItems, metadata);
                    });
                });
            });

            handle('markItemBought', function (payload, metadata, apply) {
                return itemsRepo(function (add, remove, update, read, list) {
                    return read(payload).then(function (readItem) {
                        readItem.bought = true;
                        return update(readItem);
                    }).then(function([updatedItem]) {
                        return apply('itemBought', updatedItem, metadata);
                    });
                });
            });

            handle('markItemNotBought', function (payload, metadata, apply) {
                return itemsRepo(function (add, remove, update, read, list) {
                    return read(payload).then(function (readItem) {
                        readItem.bought = false;
                        return update([readItem]);
                    }).then(function(updatedItem) {
                        return apply('itemNotBought', updatedItem, metadata);
                    });
                });
            });
        });

        // the suggestion aggregate
        aggregate('suggestions')
            .handle('addSuggestions', function (payload, metadata, apply) {
                return apply('suggestionsAdded', payload, metadata);
            })
            .handle('removeSuggestions', function (payload, metadata, apply) {
                return apply('suggestionsRemoved', payload, metadata);
            })
            .handle('clearSuggestions', function (payload, metadata, apply) {
                return apply('suggestionsCleared', payload, metadata);
            })
            .handle('exportSuggestions', function (payload, metadata, apply) {
                return apply('suggestionsExported', payload, metadata);
            })
            .handle('importSuggestions', function (payload, metadata, apply) {
                return apply('suggestionsImported', payload, metadata);
            });

    }, {
        id: 'aggregates',
        namespace: 'shopper'
    });

}(this))

(function(global){
    // items view component

    global.cqrs(function (send, handle, publish, listen, aggregate) {

        listen('itemsAdded', function (payload, metadata) {});
        listen('itemsRemoved', function (payload, metadata) {});
        listen('itemBought', function (payload, metadata) {});
        listen('itemNotBought', function (payload, metadata) {});

    }, {
        id: 'itemsView',
        namespace: 'shopper'
    });

}(this))

(function(global){
    // suggestions view component

    global.cqrs(function (send, handle, publish, listen, aggregate) {

        listen('suggestionsAdded', function (payload, metadata) {});
        listen('suggestionsRemoved', function (payload, metadata) {});
        listen('suggestionsCleared', function (payload, metadata) {});
        listen('suggestionsExported', function (payload, metadata) {});
        listen('suggestionsImported', function (payload, metadata) {});

    }, {
        id: 'suggestionsView',
        namespace: 'shopper'
    });

}(this))

(function(global){
    // suggestions autocomplete component

    global.cqrs(function (send, handle, publish, listen, aggregate) {

        listen('suggestionsAdded', function (payload, metadata) {});
        listen('suggestionsRemoved', function (payload, metadata) {});
        listen('suggestionsCleared', function (payload, metadata) {});
        listen('suggestionsExported', function (payload, metadata) {});
        listen('suggestionsImported', function (payload, metadata) {});

    }, {
        id: 'suggestionsAutocomplete',
        namespace: 'shopper'
    });

}(this))
