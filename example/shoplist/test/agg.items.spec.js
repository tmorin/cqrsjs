/*globals localStorage:true, describe:false, beforeEach:false, afterEach:false, it:false */
/*jshint -W030, browser:false */

var LocalStorage = require('node-localstorage').LocalStorage;
var storage = new LocalStorage('./localstorage');
localStorage = storage;

function getData(name) {
    return JSON.parse(storage.getItem(name));
}
function setData(name, data) {
    storage.setItem(name, JSON.stringify(data));
}

var cqrs = require('../../../lib/cqrs');
require('../lib/agg.items.handlers');
require('../lib/agg.items.repo.local');

var chai = require('chai');
var sinonChai = require('sinon-chai');
var charAsPromised = require('chai-as-promised');

chai.should();
chai.use(sinonChai);
chai.use(charAsPromised);

describe('aggregate items', function() {
    var domain;
    beforeEach(function() {
        domain = cqrs({
            namespace: 'domain'
        });
    });
    afterEach(function() {
        domain.destroy();
    });

    describe('GIVEN no added items', function() {
        beforeEach(function() {
            setData('items', {});
            setData('suggestions', []);
        });
        describe('WHEN an item is added', function() {
            beforeEach(function() {
                return domain.send('addItem', {
                    label: 'item1',
                    quantity: 2
                });
            });
            it('THEN it should be stored', function() {
                var items = getData('items');
                items.item1.label.should.eq('item1');
                items.item1.quantity.should.eq(2);
            });
        });
        describe('WHEN an item is removed', function() {
            beforeEach(function() {
                return domain.send('removeItem', {
                    label: 'item1'
                }).should.be.rejected;
            });
            it('THEN it should not be removed', function() {
                var items = getData('items');
                Object.keys(items).should.be.lengthOf(0);
            });
        });
        describe('WHEN an item is marked', function() {
            beforeEach(function() {
                return domain.send('markItem', {
                    label: 'item1'
                }).should.be.rejected;
            });
            it('THEN it should not be marked', function() {
                var items = getData('items');
                Object.keys(items).should.be.lengthOf(0);
            });
        });
    });

    describe('GIVEN an item with the label item1', function() {
        beforeEach(function() {
            setData('items', {
                item1: {
                    label: 'item1',
                    quantity: 1
                }
            });
        });
        describe('WHEN the application start', function() {
            var loadedItems;
            beforeEach(function(done) {
                domain.on('itemsLoaded').invoke(function (items) {
                    loadedItems = items;
                    done();
                });
                domain.send('loadItems');
            });
            it('THEN items should be loaded', function() {
                loadedItems[0].label.should.eq('item1');
                loadedItems[0].quantity.should.eq(1);
            });
        });
        describe('WHEN an item is added with label item1', function() {
            beforeEach(function() {
                return domain.send('addItem', {
                    label: 'item1',
                    quantity: 2
                }).should.be.rejected;
            });
            it('THEN it should not be stored', function() {
                var items = getData('items');
                items.item1.label.should.eq('item1');
                items.item1.quantity.should.eq(1);
            });
        });
        describe('WHEN item1 is removed', function() {
            beforeEach(function() {
                return domain.send('removeItem', {
                    label: 'item1'
                });
            });
            it('THEN it should be removed', function() {
                var items = getData('items');
                Object.keys(items).should.be.lengthOf(0);
            });
        });
        describe('WHEN item1 is marked', function() {
            beforeEach(function() {
                return domain.send('markItem', {
                    label: 'item1'
                });
            });
            it('THEN it should be marked', function() {
                var items = getData('items');
                items.item1.label.should.eq('item1');
                items.item1.marked.should.eq(true);
            });
            describe('WHEN item1 is unmarked', function() {
                beforeEach(function() {
                    return domain.send('unmarkItem', {
                        label: 'item1'
                    });
                });
                it('THEN it should be marked', function() {
                    var items = getData('items');
                    items.item1.label.should.eq('item1');
                    items.item1.marked.should.eq(false);
                });
            });
        });
        describe('WHEN item1\'s quantity is updated', function() {
            beforeEach(function() {
                return domain.send('updateQuantityItem', {
                    label: 'item1',
                    quantity: 10
                });
            });
            it('THEN it should be updated', function() {
                var items = getData('items');
                items.item1.label.should.eq('item1');
                items.item1.quantity.should.eq(10);
            });
        });
    });

});
/*jshint +W030 */