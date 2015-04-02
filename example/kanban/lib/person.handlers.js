var t = require('tcomb');
var uuid = require('uuid');
var cqrs = require('../../../lib/cqrs');
var c = cqrs();

var personsAgg = c.aggregate('persons');

/* ADD */

var PersonAdded = t.struct({
    personId: t.Str,
    name: t.Str
}, 'PersonAdded');

personsAgg.when('add-person').invoke(function(payload, metadata) {
    return c.call('check-right', 'manage-persons', metadata.userId).then(function() {
        return new PersonAdded({
            personId: uuid.v4(),
            name: payload.name
        });
    });
}).apply('person-added');

/* UPDATE DETAILS */

var PersonDetailsUpdated = t.struct({
    personId: t.Str,
    name: t.Str
}, 'PersonDetailsUpdated');

personsAgg.when('update-person-details').invoke(function(payload, metadata) {
    return c.call('check-right', 'manage-persons', metadata.userId).then(function() {
        return new PersonDetailsUpdated({
            personId: payload.personId,
            name: payload.name
        });
    });
}).apply('person-details-updated');

/* REMOVE */

var PersonRemoved = t.struct({
    personId: t.Str,
    name: t.Str
}, 'PersonRemoved');

personsAgg.when('remove-person').invoke(function(payload, metadata) {
    return c.call('check-right', 'manage-persons', metadata.userId).then(function() {
        return c.call('get-person', payload.personId);
    }).then(function(person) {
        return new PersonRemoved({
            personId: person.personId,
            name: person.name
        });
    });
}).apply('person-removed');
