if (typeof localStorage === "undefined" || localStorage === null) {
    var JSONStorage = require('node-localstorage').JSONStorage;
    jsonStorage = new JSONStorage('./localstorage');
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./localstorage');
}

var cqrs = require('../../../lib/cqrs')
var aggSuggestionsHandlers = require('../lib/agg.suggestions.handlers');
var aggSuggestionsRepoLocal = require('../lib/agg.suggestions.repo.local');

var chai = require('chai');
var sinon = require('sinon');
var sinonChai = require('sinon-chai');
var charAsPromised = require('chai-as-promised');

chai.should();
var expect = chai.expect;
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
            jsonStorage.removeItem('items');
            jsonStorage.removeItem('suggestions');
        });
        describe('WHEN a suggestion is added', function() {
            beforeEach(function() {
                return domain.send('addSuggestion', 'item1');
            });
            it('THEN it should be stored', function() {
                var suggestions = jsonStorage.getItem('suggestions');
                suggestions[0].should.eq('item1');
            });
        });
        describe('WHEN an suggestion is removed', function() {
            beforeEach(function() {
                return domain.send('removeSuggestion', 'item1').should.be.rejected;
            });
            it('THEN it should not be removed', function() {
                var suggestions = jsonStorage.getItem('suggestions');
                expect(suggestions).to.be.null;
            });
        });
    });

    describe('GIVEN added suggestions', function() {
        beforeEach(function() {
            jsonStorage.setItem('suggestions', ['item1']);
        });
        describe('WHEN the application start', function() {
            var p, loadedSuggestions;
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
                return domain.send('addSuggestion', 'item1').should.be.rejected;;
            });
            it('THEN it should be stored', function() {
                var suggestions = jsonStorage.getItem('suggestions');
                suggestions.should.have.lengthOf(1);
            });
        });
        describe('WHEN an suggestion is removed', function() {
            beforeEach(function() {
                return domain.send('removeSuggestion', 'item1');
            });
            it('THEN it should be removed', function() {
                var suggestions = jsonStorage.getItem('suggestions');
                suggestions.should.have.lengthOf(0);
            });
        });
    });

});