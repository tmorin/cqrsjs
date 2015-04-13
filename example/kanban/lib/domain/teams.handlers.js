var uuid = require('uuid');
var chai = require('chai');
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

var teamsAgg = c.aggregate('teams');

/* ADD */

teamsAgg.when('add-team').invoke(function(payload, metadata) {
    chai.assert.ok(payload.name, 'name is required');
    return c.call('check-right', 'manage-teams', metadata.userId).then(function() {
        return {
            teamId: uuid.v4(),
            name: payload.name
        };
    });
}).apply('team-added');

/* UPDATE DETAILS */

teamsAgg.when('update-team-details').invoke(function(payload, metadata) {
    chai.assert.ok(payload.teamId, 'teamId is required');
    chai.assert.ok(payload.name, 'name is required');
    return c.call('check-right', 'manage-team', metadata.userId, payload.teamId).then(function() {
        return {
            teamId: payload.teamId,
            name: payload.name,
            description: payload.description
        };
    });
}).apply('team-details-updated');

/* REMOVE */

teamsAgg.when('remove-team').invoke(function(payload, metadata) {
    chai.assert.ok(payload.teamId, 'teamId is required');
    return c.call('check-right', 'manage-team', metadata.userId, payload.teamId).then(function() {
        return c.call('get-team', payload.teamId);
    }).then(function(team) {
        return {
            teamId: team.teamId,
            name: team.name
        };
    });
}).apply('team-removed');
