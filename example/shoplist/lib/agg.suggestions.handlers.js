(function(root, factory) {
    /* globals define:false */
    'use strict';
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(['cqrsjs'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../../../lib/cqrs'));
    } else {
        root.aggSuggestionsHandlers = factory(root.cqrs);
    }
}(this, function(cqrs) {
    'use strict';

    var domain = cqrs({
        namespace: 'domain'
    });

    var suggestionsAgg = domain.aggregate('suggestions');

    suggestionsAgg.when('addSuggestion').invoke(function(payload) {
        return domain.call('suggestionNotAlreadyAdded', payload).then(function() {
            return payload;
        });
    }).apply('suggestionAdded');

    suggestionsAgg.when('removeSuggestion').invoke(function(payload) {
        return domain.call('suggestionAlreadyAdded', payload).then(function() {
            return payload;
        });
    }).apply('suggestionRemoved');

    suggestionsAgg.when('loadSuggestions').invoke(function() {
        return domain.call('getAllSuggestions');
    }).apply('suggestionsLoaded');

    return suggestionsAgg;
}));
