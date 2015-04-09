var storage = require('../storage').local;
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

function loadData() {
    return JSON.parse(storage.getItem('rights'));
}

function persistData(rights) {
    storage.setItem('rights', JSON.stringify(rights));
}

var rightsAgg = c.aggregate('rights');

rightsAgg.on('roles-updated').invoke(function(payload) {
    var rights = loadData();
    rights[payload.personId].roles = payload.roles;
    persistData(rights);
});

rightsAgg.when('person-removed').invoke(function(payload) {
    var rights = loadData();
    delete rights[payload.personId];
    persistData(rights);
}).apply();

c.calling('has-role').invoke(function(personId, role) {
    var personRights = loadData()[personId];
    if (!personRights || !personRights.roles) {
        return false;
    }
    return personRights.roles.indexOf(role) > -1;
});
