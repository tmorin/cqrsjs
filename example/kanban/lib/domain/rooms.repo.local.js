var storage = require('../storage').local;
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

function loadData() {
    return JSON.parse(storage.getItem('rooms')) || {};
}

function persistData(rooms) {
    storage.setItem('rooms', JSON.stringify(rooms));
}

var roomsAgg = c.aggregate('rooms');

roomsAgg.on('room-added').invoke(function(payload) {
    var rooms = loadData();
    rooms[payload.roomId] = payload;
    rooms[payload.roomId].teams = [];
    persistData(rooms);
});

roomsAgg.on('room-details-updated').invoke(function(payload) {
    var rooms = loadData();
    rooms[payload.roomId].name = payload.name;
    rooms[payload.roomId].description = payload.description;
    persistData(rooms);
});

roomsAgg.on('room-linked-to-team').invoke(function(payload) {
    var rooms = loadData();
    rooms[payload.roomId].teams.push(payload.teamId);
    persistData(rooms);
});

roomsAgg.on('room-unlinked-to-team').invoke(function(payload) {
    var rooms = loadData();
    var index = rooms[payload.roomId].teams.indexOf(payload.teamId);
    rooms[payload.roomId].teams.splice(index, 1);
    persistData(rooms);
});

roomsAgg.on('room-removed').invoke(function(payload) {
    var rooms = loadData();
    delete rooms[payload.roomId];
    persistData(rooms);
});

/* QUERIES */

c.calling('get-room').invoke(function(roomId) {
    return Promise.resolve().then(function() {
        var rooms = loadData();
        var room = rooms[roomId];
        if (!room) {
            throw new Error('unable to find the room: ' + roomId);
        }
        return room;
    });
});

c.calling('is-room-not-linked-to-team').invoke(function(roomId, teamId) {
    return Promise.resolve().then(function() {
        var rooms = loadData();
        var index = rooms[roomId].teams.indexOf(teamId);
        if (index > -1) {
            throw new Error('the room ' + roomId + ' is already linked to the team ' + teamId);
        }
        return true;
    });
});

c.calling('is-room-linked-to-team').invoke(function(roomId, teamId) {
    return Promise.resolve().then(function() {
        var rooms = loadData();
        var index = rooms[roomId].teams.indexOf(teamId);
        if (index < 0) {
            throw new Error('the room ' + roomId + ' is not linked to the team ' + teamId);
        }
        return true;
    });
});
