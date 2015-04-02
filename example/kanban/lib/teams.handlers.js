var t = require('tcomb');
var uuid = require('uuid');
var cqrs = require('../../../lib/cqrs');
var c = cqrs();

var teamsAgg = c.aggregate('teams');

/* ADD */

var TeamAdded = t.struct({
    teamId: t.Str,
    name: t.Str
}, 'TeamAdded');

teamsAgg.when('add-team').invoke(function(payload, metadata) {
    return c.call('check-right', 'manage-teams', metadata.userId).then(function() {
        return new TeamAdded({
            teamId: uuid.v4(),
            name: payload.name
        });
    });
}).apply('team-added');

/* UPDATE DETAILS */

var TeamDetailsUpdated = t.struct({
    teamId: t.Str,
    name: t.Str,
    description: t.Str
}, 'TeamDetailsUpdated');

teamsAgg.when('update-team-details').invoke(function(payload, metadata) {
    return c.call('check-right', 'manage-teams', metadata.userId).then(function() {
        return new TeamDetailsUpdated({
            teamId: payload.teamId,
            name: payload.name,
            description: payload.description
        });
    });
}).apply('team-details-updated');

/* REMOVE */

var TeamRemoved = t.struct({
    teamId: t.Str,
    name: t.Str
}, 'TeamRemoved');

teamsAgg.when('remove-team').invoke(function(payload, metadata) {
    return c.call('check-right', 'manage-teams', metadata.userId).then(function() {
        return c.call('get-team', payload.teamId);
    }).then(function(team) {
        return new TeamRemoved({
            teamId: team.teamId,
            name: team.name
        });
    });
}).apply('team-removed');
