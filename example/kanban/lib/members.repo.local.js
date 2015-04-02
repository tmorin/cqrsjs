var t = require('tcomb');
var uuid = require('uuid');
var cqrs = require('../../../lib/cqrs');
var c = cqrs();

/* AGGREGATE */

var membersAgg = c.aggregate('members')

membersAgg.on('member-added').invoke(function(payload) {
    var members = JSONStorage.getItem('members') || [];
    members.push(payload);
    JSONStorage.setItem('members', members);
});

membersAgg.on('member-updated').invoke(function(payload) {
    var members = JSONStorage.getItem('members') || [];
    var member = members.filter(function(member) {
        return member.teamId === payload.teamId && member.personId === payload.personId;
    })[0];
    member.teamName = payload.teamName;
    member.personName = payload.personName;
    JSONStorage.setItem('members', members);
});

membersAgg.on('member-removed').invoke(function(payload) {
    var members = JSONStorage.getItem('members') || [];
    var member = members.filter(function(member) {
        return member.teamId === payload.teamId && member.personId === payload.personId;
    })[0];
    var index = members.indexOf(members);
    members.splice(index, 1);
    JSONStorage.setItem('members', members);
});

/* QUERIES */

c.calling('is-not-member').invoke(function(teamId, personId) {
    var members = JSONStorage.getItem('members') || [];
    var member = members.filter(function(member) {
        return member.teamId === payload.teamId && member.personId === payload.personId;
    })[0];
    if (member) {
        throw new Error(member.personName + ' is already member of ' + member.teamName);
    }
});

c.calling('is-member').invoke(function(teamId, personId) {
    var members = JSONStorage.getItem('members') || [];
    var member = members.filter(function(member) {
        return member.teamId === payload.teamId && member.personId === payload.personId;
    })[0];
    if (!member) {
        throw new Error(member.personName + ' is not member of ' + member.teamName);
    }
});

c.calling('list-members-from-team').invoke(function(teamId) {
    var members = JSONStorage.getItem('members') || [];
    return members.filter(function(member) {
        return member.teamId === teamId;
    });
});

c.calling('list-members-from-person').invoke(function(personId) {
    var members = JSONStorage.getItem('members') || [];
    return members.filter(function(member) {
        return member.personId === personId;
    });
});
