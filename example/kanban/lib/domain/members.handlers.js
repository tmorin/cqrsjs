var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

var membersAgg = c.aggregate('members');

/* ADD */

membersAgg.when('add-member').invoke(function(payload, metadata) {
    return Promise.all([
        c.call('check-right', 'manage-team', metadata.userId, metadata.roomId),
        c.call('is-person-not-member-of-team', payload.teamId, payload.personId)
    ]).then(function() {
        return Promise.all([
            c.call('get-team', payload.teamId),
            c.call('get-person', payload.personId)
        ]);
    }).then(function(result) {
        return {
            teamId: result[0].teamId,
            teamName: result[0].name,
            personId: result[1].personId,
            personName: result[1].name
        };
    });
}).apply('member-added');

/* REMOVE */

membersAgg.when('remove-member').invoke(function(payload, metadata) {
    return Promise.all([
        c.call('check-right', 'manage-team', metadata.userId, metadata.roomId),
        c.call('is-person-member-of-team', payload.teamId, payload.personId)
    ]).then(function() {
        return Promise.all([
            c.call('get-team', payload.teamId),
            c.call('get-person', payload.personId)
        ]).then(function(result) {
            return {
                teamId: result[0].teamId,
                teamName: result[0].name,
                personId: result[1].personId,
                personName: result[1].name
            };
        });
    });
}).apply('member-removed');

/* REMOVE WHEN TEAM REMOVED */

membersAgg.when('team-removed').invoke(function(payload) {
    return c.call('list-members-from-team', payload.teamId).then(function(members) {
        return members;
    });
}).forEach().apply('member-removed');

/* UPDATE WHEN TEAM UPDATED */

membersAgg.when('team-updated').invoke(function(payload) {
    return c.call('list-members-from-team', payload.teamId).then(function(members) {
        return members.map(function(member) {
            member.teamName = payload.name;
            return member;
        });
    });
}).forEach().apply('member-updated');

/* REMOVE WHEN PERSON REMOVED */

membersAgg.when('person-removed').invoke(function(payload) {
    return c.call('list-members-from-person', payload.personId).then(function(members) {
        return members;
    });
}).forEach().apply('member-removed');

/* UPDATE WHEN TEAM UPDATED */

membersAgg.when('person-updated').invoke(function(payload) {
    return c.call('list-members-from-person', payload.personId).then(function(members) {
        return members.map(function(member) {
            member.personName = payload.name;
            return member;
        });
    });
}).forEach().apply('member-updated');
