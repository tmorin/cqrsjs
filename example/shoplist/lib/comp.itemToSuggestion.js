(function(root, factory) {
    /* globals define:false, module:false */
    'use strict';
    /* istanbul ignore next */
    if (typeof define === 'function' && define.amd) {
        define(['cqrsjs'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('../../../lib/cqrs'));
    } else {
        root.compItemToSuggestion = factory(root.cqrs);
    }
}(this, function(cqrs) {
    'use strict';

    var domain = cqrs({
        namespace: 'domain'
    });

    domain.on('itemAdded').invoke(function(payload) {
        return domain.send('addSuggestion', payload.label).then(null, function() {
            return Promise.resolve(payload);
        });
    });

    return domain;
}));
