var t = require('tcomb');
var uuid = require('uuid');
var cqrs = require('../../../lib/cqrs');
var c = cqrs();

var personsAgg = c.aggregate('persons')

personsAgg.on('person-added').invoke(function(payload) {
    var persons = JSONStorage.getItem('persons') || {};
    persons[payload.personId] = payload;
    JSONStorage.setItem('persons', persons);
});

personsAgg.on('person-details-updated').invoke(function(payload) {
    var persons = JSONStorage.getItem('persons') || [];
    persons[payload.personId].name = payload.name;
    JSONStorage.setItem('persons', persons);
});

personsAgg.on('person-removed').invoke(function(payload) {
    var persons = JSONStorage.getItem('persons') || [];
    delete persons[payload.personId];
    JSONStorage.setItem('persons', persons);
});
