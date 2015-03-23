(function(root, factory) {
    /* globals define:false */
    'use strict';
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(['cqrsjs'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../../../lib/cqrs'));
    } else {
        root.aggItemsHandlers = factory(root.cqrs);
    }
}(this, function(cqrs) {
    'use strict';

    var domain = cqrs({
        namespace: 'domain'
    });

    var itemsAgg = domain.aggregate('items');

    itemsAgg.when('addItem').invoke(function(payload) {
        return domain.call('itemNotAlreadyAdded', payload.label).then(function() {
            return {
                label: payload.label,
                marked: false,
                quantity: payload.quantity
            };
        });
    }).apply('itemAdded');

    itemsAgg.when('removeItem').invoke(function(payload) {
        return domain.call('itemAlreadyAdded', payload.label).then(function() {
            return {
                label: payload.label
            };
        });
    }).apply('itemRemoved');

    itemsAgg.when('updateQuantityItem').invoke(function(payload) {
        return domain.call('itemAlreadyAdded', payload.label).then(function() {
            return {
                label: payload.label,
                quantity: payload.quantity
            };
        });
    }).apply('quantityItemUpdated');

    itemsAgg.when('markItem').invoke(function(payload) {
        return domain.call('itemAlreadyAdded', payload.label).then(function() {
            return {
                label: payload.label,
                marked: true
            };
        });
    }).apply('itemMarked');

    itemsAgg.when('unmarkItem').invoke(function(payload) {
        return domain.call('itemAlreadyAdded', payload.label).then(function() {
            return {
                label: payload.label,
                marked: false
            };
        });
    }).apply('itemUnmarked');

    itemsAgg.when('loadItems').invoke(function() {
        return domain.call('getAllItems');
    }).apply('itemsLoaded');

    return domain;
}));
