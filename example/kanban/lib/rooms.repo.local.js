var t = require('tcomb');
var uuid = require('uuid');
var cqrs = require('../../../lib/cqrs');
var c = cqrs();

var roomsAgg = c.aggregate('rooms')

roomsAgg.on('room-added').invoke(function(payload) {
    var rooms = JSONStorage.getItem('rooms') || {};
    rooms[payload.roomId] = payload;
    JSONStorage.setItem('rooms', rooms);
});

roomsAgg.on('room-details-updated').invoke(function(payload) {
    var rooms = JSONStorage.getItem('rooms') || [];
    rooms[payload.roomId].name = payload.name;
    rooms[payload.roomId].description = payload.description;
    JSONStorage.setItem('rooms', rooms);
});

roomsAgg.on('room-removed').invoke(function(payload) {
    var rooms = JSONStorage.getItem('rooms') || [];
    delete rooms[payload.roomId];
    JSONStorage.setItem('rooms', rooms);
});
