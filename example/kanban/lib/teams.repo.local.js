var t = require('tcomb');
var uuid = require('uuid');
var cqrs = require('../../../lib/cqrs');
var c = cqrs();

var teamsAgg = c.aggregate('teams')

teamsAgg.on('team-added').invoke(function(payload) {
    var teams = JSONStorage.getItem('teams') || {};
    teams[payload.teamId] = payload;
    JSONStorage.setItem('teams', teams);
});

teamsAgg.on('team-details-updated').invoke(function(payload) {
    var teams = JSONStorage.getItem('teams') || [];
    teams[payload.teamId].name = payload.name;
    teams[payload.teamId].description = payload.description;
    JSONStorage.setItem('teams', teams);
});

teamsAgg.on('team-removed').invoke(function(payload) {
    var teams = JSONStorage.getItem('teams') || [];
    delete teams[payload.teamId];
    JSONStorage.setItem('teams', teams);
});
