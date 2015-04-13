var uuid = require('uuid');
var chai = require('chai');
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

var personsAgg = c.aggregate('persons');

/* ADD */

personsAgg.when('add-person').invoke(function(payload, metadata) {
    chai.assert.ok(payload.name, 'name is required');
    return c.call('check-right', 'manage-persons', metadata.userId).then(function() {
        return {
            personId: uuid.v4(),
            name: payload.name
        };
    });
}).apply('person-added');

/* UPDATE DETAILS */

personsAgg.when('update-person-details').invoke(function(payload, metadata) {
    chai.assert.ok(payload.personId, 'personId is required');
    chai.assert.ok(payload.name, 'name is required');
    return c.call('check-right', 'manage-person', metadata.userId, payload.personId).then(function() {
        return {
            personId: payload.personId,
            name: payload.name
        };
    });
}).apply('person-details-updated');

/* REMOVE */

personsAgg.when('remove-person').invoke(function(payload, metadata) {
    chai.assert.ok(payload.personId, 'personId is required');
    return c.call('check-right', 'manage-person', metadata.userId, payload.personId).then(function() {
        return c.call('get-person', payload.personId);
    }).then(function(person) {
        return {
            personId: person.personId,
            name: person.name
        };
    });
}).apply('person-removed');
