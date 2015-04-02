var t = require('tcomb');
var uuid = require('uuid');
var cqrs = require('../../../lib/cqrs');
var c = cqrs();

var roomsAgg = c.aggregate('rooms');

/* ADD */

var RoomAdded = t.struct({
    roomId: t.Str,
    name: t.Str
}, 'RoomAdded');

roomsAgg.when('add-room').invoke(function(payload, metadata) {
    return c.call('check-right', 'manage-rooms', metadata.userId).then(function() {
        return new RoomAdded({
            roomId: uuid.v4(),
            name: payload.name
        });
    });
}).apply('room-added');

/* UPDATE DETAILS */

var RoomDetailsUpdated = t.struct({
    roomId: t.Str,
    name: t.Str
}, 'RoomDetailsUpdated');

roomsAgg.when('update-room-details').invoke(function(payload, metadata) {
    return c.call('check-right', 'manage-rooms', metadata.userId).then(function() {
        return new RoomDetailsUpdated({
            roomId: payload.roomId,
            name: payload.name
        });
    });
}).apply('room-details-updated');

/* REMOVE */

var RoomRemoved = t.struct({
    roomId: t.Str,
    name: t.Str
}, 'RoomRemoved');

roomsAgg.when('remove-room').invoke(function(payload, metadata) {
    return c.call('check-right', 'manage-rooms', metadata.userId).then(function() {
        return c.call('get-room', payload.roomId);
    }).then(function(room) {
        return new RoomRemoved({
            roomId: room.roomId,
            name: room.name
        });
    });
}).apply('room-removed');
