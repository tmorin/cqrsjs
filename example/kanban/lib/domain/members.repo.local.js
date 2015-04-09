var storage = require('../storage').local;
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

function loadData() {
    return JSON.parse(storage.getItem('members')) || [];
}

function persistData(members) {
    storage.setItem('members', JSON.stringify(members));
}

/* AGGREGATE */

var membersAgg = c.aggregate('members');

membersAgg.on('member-added').invoke(function(payload) {
    var members = loadData();
    members.push(payload);
    persistData(members);
});

membersAgg.on('member-updated').invoke(function(payload) {
    var members = loadData();
    var member = members.filter(function(member) {
        return member.teamId === payload.teamId && member.personId === payload.personId;
    })[0];
    member.teamName = payload.teamName;
    member.personName = payload.personName;
    persistData(members);
});

membersAgg.on('member-removed').invoke(function(payload) {
    var members = loadData();
    var member = members.filter(function(member) {
        return member.teamId === payload.teamId && member.personId === payload.personId;
    })[0];
    var index = members.indexOf(member);
    members.splice(index, 1);
    persistData(members);
});

/* QUERIES */

c.calling('is-person-not-member-of-team').invoke(function(teamId, personId) {
    var members = loadData();
    var member = members.filter(function(member) {
        return member.teamId === teamId && member.personId === personId;
    })[0];
    if (member) {
        throw new Error(member.personName + ' is already member of ' + member.teamName);
    }
});

c.calling('is-person-member-of-team').invoke(function(teamId, personId) {
    var members = loadData();
    var member = members.filter(function(member) {
        return member.teamId === teamId && member.personId === personId;
    })[0];
    if (!member) {
        throw new Error(member.personName + ' is not member of ' + member.teamName);
    }
});

c.calling('list-members-from-team').invoke(function(teamId) {
    var members = loadData();
    return members.filter(function(member) {
        return member.teamId === teamId;
    });
});

c.calling('list-members-from-person').invoke(function(personId) {
    var members = loadData();
    return members.filter(function(member) {
        return member.personId === personId;
    });
});
