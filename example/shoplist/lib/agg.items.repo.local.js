(function(root, factory) {
    /* globals define:false */
    'use strict';
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(['cqrsjs'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../../../lib/cqrs'));
    } else {
        root.aggItemsRepoLocal = factory(root.cqrs);
    }
}(this, function(cqrs) {
    'use strict';

    function getItems() {
        return JSON.parse(localStorage.getItem('items')) || {};
    }

    function setItems(items) {
        localStorage.setItem('items', JSON.stringify(items));
    }

    var domain = cqrs({
        namespace: 'domain'
    });

    domain.calling('itemNotAlreadyAdded').invoke(function(label) {
        var items = getItems();
        return typeof items[label] === 'object' ? Promise.reject('already added') : Promise.resolve();
    });

    domain.calling('itemAlreadyAdded').invoke(function(label) {
        var items = getItems();
        return typeof items[label] !== 'object' ? Promise.reject('not already added') : Promise.resolve();
    });

    domain.calling('getAllItems').invoke(function() {
        var items = getItems();
        return Object.keys(items).map(function(k) {
            return items[k];
        });
    });

    var itemsAgg = domain.aggregate('items');

    itemsAgg.on('itemAdded').invoke(function(payload) {
        var items = getItems();
        items[payload.label] = payload;
        setItems(items)
    });

    itemsAgg.on('itemRemoved').invoke(function(payload) {
        var items = getItems();
        delete items[payload.label];
        setItems(items)
    });

    itemsAgg.on('quantityItemUpdated').invoke(function(payload) {
        var items = getItems();
        items[payload.label].quantity = payload.quantity;
        setItems(items)
    });

    itemsAgg.on('itemMarked').invoke(function(payload) {
        var items = getItems();
        items[payload.label].marked = true;
        setItems(items)
    });

    itemsAgg.on('itemUnmarked').invoke(function(payload) {
        var items = getItems();
        items[payload.label].marked = false;
        setItems(items)
    });

    return domain;
}));
