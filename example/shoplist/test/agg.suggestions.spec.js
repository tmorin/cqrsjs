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
require('../lib/agg.suggestions.handlers');
require('../lib/agg.suggestions.repo.local');

var chai = require('chai');
var sinonChai = require('sinon-chai');
var charAsPromised = require('chai-as-promised');

chai.should();
chai.use(sinonChai);
chai.use(charAsPromised);

describe('aggregate suggestions', function() {
    var domain;
    beforeEach(function() {
        domain = cqrs({
            namespace: 'domain'
        });
    });
    afterEach(function() {
        domain.destroy();
    });

    describe('GIVEN no added suggestions', function() {
        beforeEach(function() {
            setData('items', {});
            setData('suggestions', []);
        });
        describe('WHEN a suggestion is added', function() {
            beforeEach(function() {
                return domain.send('addSuggestion', 'item1');
            });
            it('THEN it should be stored', function() {
                var suggestions = getData('suggestions');
                suggestions[0].should.eq('item1');
            });
        });
        describe('WHEN an suggestion is removed', function() {
            beforeEach(function() {
                return domain.send('removeSuggestion', 'item1').should.be.rejected;
            });
            it('THEN it should not be removed', function() {
                var suggestions = getData('suggestions');
                suggestions.should.be.lengthOf(0);
            });
        });
    });

    describe('GIVEN added suggestions', function() {
        beforeEach(function() {
            setData('suggestions', ['item1']);
        });
        describe('WHEN the application start', function() {
            var loadedSuggestions;
            beforeEach(function(done) {
                domain.on('suggestionsLoaded').invoke(function (suggestions) {
                    loadedSuggestions = suggestions;
                    done();
                });
                domain.send('loadSuggestions');
            });
            it('THEN suggestions should be loaded', function() {
                loadedSuggestions.should.have.lengthOf(1);
            });
        });
        describe('WHEN a suggestion is added', function() {
            beforeEach(function() {
                return domain.send('addSuggestion', 'item1').should.be.rejected;
            });
            it('THEN it should be stored', function() {
                var suggestions = getData('suggestions');
                suggestions.should.have.lengthOf(1);
            });
        });
        describe('WHEN an suggestion is removed', function() {
            beforeEach(function() {
                return domain.send('removeSuggestion', 'item1');
            });
            it('THEN it should be removed', function() {
                var suggestions = getData('suggestions');
                suggestions.should.have.lengthOf(0);
            });
        });
    });

});
/*jshint +W030 */