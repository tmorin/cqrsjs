(function(root, factory) {
    /* globals define:false, module:false */
    'use strict';
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(['cqrsjs'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../../../lib/cqrs'));
    } else {
        root.aggSuggestionsRepoLocal = factory(root.cqrs);
    }
}(this, function(cqrs) {
    'use strict';

    function getSuggestions() {
        return JSON.parse(localStorage.getItem('suggestions')) || [];
    }

    function setSuggestions(suggestions) {
        localStorage.setItem('suggestions', JSON.stringify(suggestions));
    }

    var domain = cqrs({
        namespace: 'domain'
    });

    domain.calling('suggestionNotAlreadyAdded').invoke(function(label) {
        return getSuggestions().indexOf(label) > -1 ? Promise.reject('already added') : Promise.resolve();
    });

    domain.calling('suggestionAlreadyAdded').invoke(function(label) {
        return getSuggestions().indexOf(label) < 0 ? Promise.reject('already added') : Promise.resolve();
    });

    domain.calling('getAllSuggestions').invoke(function() {
        return getSuggestions();
    });

    var suggestionsAgg = domain.aggregate('suggestions');

    suggestionsAgg.on('suggestionAdded').invoke(function(payload) {
        var suggestions = getSuggestions();
        suggestions.push(payload);
        setSuggestions(suggestions);
    });

    suggestionsAgg.on('suggestionRemoved').invoke(function(payload) {
        var suggestions = getSuggestions();
        var i = suggestions.indexOf(payload);
        suggestions.splice(i, 1);
        setSuggestions(suggestions);
    });

    return domain;
}));
