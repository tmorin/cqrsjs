var storage = require('../storage').local;
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

function loadData() {
    return JSON.parse(storage.getItem('teams')) || {};
}

function persistData(teams) {
    storage.setItem('teams', JSON.stringify(teams));
}

/* AGGREGATE */

var teamsAgg = c.aggregate('teams');

teamsAgg.on('team-added').invoke(function(payload) {
    var teams = loadData();
    teams[payload.teamId] = payload;
    persistData(teams);
});

teamsAgg.on('team-details-updated').invoke(function(payload) {
    var teams = loadData();
    teams[payload.teamId].name = payload.name;
    teams[payload.teamId].description = payload.description;
    persistData(teams);
});

teamsAgg.on('team-removed').invoke(function(payload) {
    var teams = loadData();
    delete teams[payload.teamId];
    persistData(teams);
});

/* QUERIES */

c.calling('get-team').invoke(function(teamId) {
    return Promise.resolve().then(function() {
        var teams = loadData();
        var team = teams[teamId];
        if (!team) {
            throw new Error('unable to find the team: ' + teamId);
        }
        return team;
    });
});
