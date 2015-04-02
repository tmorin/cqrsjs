var t = require('tcomb');
var uuid = require('uuid');
var cqrs = require('../../../lib/cqrs');
var c = cqrs();

var membersAgg = c.aggregate('members');

/* ADD */

var MemberAdded = t.struct({
    teamId: t.Str,
    teamName: t.Str,
    personId: t.Str,
    personName: t.Str
}, 'MemberAdded');

membersAgg.when('add-member').invoke(function(payload, metadata) {
    return Promise.all(
        c.call('check-right', 'manage-teams', metadata.userId),
        c.call('is-not-member', payload.teamId, payload.personId)
    ).then(function() {
        return Promise.all(
            c.call('get-team', payload.teamId),
            c.call('get-person', payload.personId)
        ).then(function(result) {
            return new MemberAdded({
                teamId: result[0].teamId,
                teamName: result[0].name,
                personId: result[1].personId,
                personName: result[1].name
            });
        });
    });
}).apply('member-added');

/* REMOVE */

var MemberRemoved = t.struct({
    teamId: t.Str,
    teamName: t.Str,
    personId: t.Str,
    personName: t.Str
}, 'MemberRemoved');

membersAgg.when('remove-member').invoke(function(payload, metadata) {
    return Promise.all(
        c.call('check-right', 'manage-teams', metadata.userId),
        c.call('is-member', payload.teamId, payload.personId)
    ).then(function() {
        return Promise.all(
            c.call('get-team', payload.teamId),
            c.call('get-person', payload.personId)
        ).then(function(result) {
            return new MemberRemoved({
                teamId: result[0].teamId,
                teamName: result[0].name,
                personId: result[1].personId,
                personName: result[1].name
            });
        });
    });
}).apply('member-removed');

/* REMOVE WHEN TEAM REMOVED*/

membersAgg.when('team-removed').invoke(function(payload, metadata) {
    return c.call('list-members-from-team', payload.teamId).then(function(members) {
        return members;
    });
}).forEach().apply('member-removed');

/* UPDATE WHEN TEAM UPDATED */

membersAgg.when('team-updated').invoke(function(payload, metadata) {
    return c.call('list-members-from-team', payload.teamId).then(function(members) {
        return members.map(function(member) {
            member.teamName = payload.name;
            return member;
        });
    });
}).forEach().apply('member-updated');

/* REMOVE WHEN PERSON REMOVED */

membersAgg.when('person-removed').invoke(function(payload, metadata) {
    return c.call('list-members-from-person', payload.personId).then(function(members) {
        return members;
    });
}).forEach().apply('member-removed');

/* UPDATE WHEN TEAM UPDATED */

membersAgg.when('person-updated').invoke(function(payload, metadata) {
    return c.call('list-members-from-person', payload.personId).then(function(members) {
        return members.map(function(member) {
            member.personName = payload.name;
            return member;
        });
    });
}).forEach().apply('member-updated');
