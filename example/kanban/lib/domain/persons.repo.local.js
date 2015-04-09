var storage = require('../storage').local;
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

function loadData() {
    return JSON.parse(storage.getItem('persons')) || {};
}

function persistData(persons) {
    storage.setItem('persons', JSON.stringify(persons));
}

var personsAgg = c.aggregate('persons');

personsAgg.on('person-added').invoke(function(payload) {
    var persons = loadData();
    persons[payload.personId] = payload;
    persistData(persons);
});

personsAgg.on('person-details-updated').invoke(function(payload) {
    var persons = loadData();
    persons[payload.personId].name = payload.name;
    persistData(persons);
});

personsAgg.on('person-removed').invoke(function(payload) {
    var persons = loadData();
    persons[payload.personId].deactivated = true;
    persistData(persons);
});

/* QUERIES */

c.calling('get-person').invoke(function(personId) {
    return Promise.resolve().then(function() {
        var persons = loadData();
        var person = persons[personId];
        if (!person || person.deactivated) {
            throw new Error('unable to find the person: ' + personId);
        }
        return person;
    });
});
