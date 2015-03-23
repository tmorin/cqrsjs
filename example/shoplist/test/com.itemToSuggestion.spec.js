if (typeof localStorage === "undefined" || localStorage === null) {
    var JSONStorage = require('node-localstorage').JSONStorage;
    jsonStorage = new JSONStorage('./localstorage');
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./localstorage');
}

var cqrs = require('../../../lib/cqrs')
var aggItemsHandlers = require('../lib/agg.items.handlers');
var aggItemsRepoLocal = require('../lib/agg.items.repo.local');
var aggSuggestionsHandlers = require('../lib/agg.suggestions.handlers');
var aggSuggestionsRepoLocal = require('../lib/agg.suggestions.repo.local');
var compItemToSuggestion = require('../lib/comp.itemToSuggestion');

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var charAsPromised = require('chai-as-promised');

chai.should();
var expect = chai.expect;
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
            jsonStorage.removeItem('items');
            jsonStorage.setItem('suggestions', ['item2']);
        });
        describe('WHEN an item is added', function() {
            beforeEach(function() {
                return domain.send('addItem', {
                    label: 'item1',
                    quantity: 3
                });
            });
            it('THEN it should be added has suggestion', function() {
                var suggestions = jsonStorage.getItem('suggestions');
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
                var suggestions = jsonStorage.getItem('suggestions');
                suggestions.should.have.lengthOf(1);
            });
        });
    });

});