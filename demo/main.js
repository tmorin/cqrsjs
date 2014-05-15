(function(global){

    global.cqrs(function (send, hanle, publish, listen, aggregate) {

        // the items aggregate
        aggregate('items', function (handle, listen) {
            handle('addItem', function (payload, metadata, apply) {
                return apply('itemAdded', payload, metadata);
            });

            handle('addItems', function (payload, metadata, apply) {
                return apply('itemsAdded', payload, metadata);
            });

            handle('removeItems', function (payload, metadata, apply) {
                return apply('itemsRemoved', payload, metadata);
            });

            handle('markItemBought', function (payload, metadata, apply) {
                return apply('itemBought', payload, metadata);
            });

            handle('markItemNotBought', function (payload, metadata, apply) {
                return apply('itemNotBought', payload, metadata);
            });

            listen('itemAdded', function (payload, metadata) {});

            listen('itemsAdded', function (payload, metadata) {});

            listen('itemsRemoved', function (payload, metadata) {});

            listen('itemBought', function (payload, metadata) {});

            listen('itemNotBought', function (payload, metadata) {});

        });

        // the suggestion aggregate
        aggregate('suggestions')
            .handle('addSuggestion', function (payload, metadata) {
                return apply('suggestionAdded', payload, metadata);
            })
            .listen('suggestionAdded', function (payload, metadata) {
            })
            .handle('addSuggestions', function (payload, metadata) {
                return apply('suggestionsAdded', payload, metadata);
            })
            .listen('suggestionsAdded', function (payload, metadata) {
            })
            .handle('removeSuggestions', function (payload, metadata) {
                return apply('suggestionsRemoved', payload, metadata);
            })
            .listen('suggestionsRemoved', function (payload, metadata) {
            })


    }, {
        id: 'aggregates',
        namespace: 'shopper'
    });

}(this))
