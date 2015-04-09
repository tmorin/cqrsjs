/*globals localStorage:true, describe:false, beforeEach:false, afterEach:false, it:false */

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
require('../lib/agg.suggestions.handlers');
require('../lib/agg.suggestions.repo.local');
require('../lib/comp.itemToSuggestion');

var chai = require('chai');
var sinonChai = require('sinon-chai');
var charAsPromised = require('chai-as-promised');

chai.should();
chai.use(sinonChai);
chai.use(charAsPromised);

describe('comp item to suggestion', function() {
    var domain;
    beforeEach(function() {
        domain = cqrs({
            namespace: 'domain'
        });
    });
    afterEach(function() {
        domain.destroy();
    });

    describe('GIVEN no added items and no suggestions', function() {
        beforeEach(function() {
            setData('items', {});
            setData('suggestions', ['item2']);
        });
        describe('WHEN an item is added', function() {
            beforeEach(function() {
                return domain.send('addItem', {
                    label: 'item1',
                    quantity: 3
                });
            });
            it('THEN it should be added has suggestion', function() {
                var suggestions = getData('suggestions');
                suggestions.should.have.lengthOf(2);
            });
        });
        describe('WHEN an item is added', function() {
            beforeEach(function() {
                return domain.send('addItem', {
                    label: 'item2',
                    quantity: 4
                });
            });
            it('THEN it should be added has suggestion', function() {
                var suggestions = getData('suggestions');
                suggestions.should.have.lengthOf(1);
            });
        });
    });

});