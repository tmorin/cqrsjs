var uuid = require('uuid');
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

var roomsAgg = c.aggregate('rooms');

/* ADD */

roomsAgg.when('add-room').invoke(function(payload, metadata) {
    return c.call('check-right', 'manage-rooms', metadata.userId).then(function() {
        return {
            roomId: uuid.v4(),
            name: payload.name
        };
    });
}).apply('room-added');

/* UPDATE DETAILS */

roomsAgg.when('update-room-details').invoke(function(payload, metadata) {
    return c.call('check-right', 'manage-room', metadata.userId, payload.roomId).then(function() {
        return {
            roomId: payload.roomId,
            name: payload.name,
            description: payload.description
        };
    });
}).apply('room-details-updated');

/* LINK ROOM TO TEAM */

roomsAgg.when('link-room-to-team').invoke(function(payload, metadata) {
    return Promise.all([
        c.call('check-right', 'manage-room', metadata.userId, payload.roomId),
        c.call('is-room-not-linked-to-team', payload.roomId, payload.teamId)
    ]).then(function() {
        return Promise.all([
            c.call('get-room', payload.roomId),
            c.call('get-team', payload.teamId)
        ]);
    }).then(function(result) {
        return {
            roomId: result[0].roomId,
            roomName: result[0].name,
            teamId: result[1].teamId,
            teamName: result[1].name
        };
    });
}).apply('room-linked-to-team');

/* UNLINK ROOM TO TEAM */

roomsAgg.when('unlink-room-to-team').invoke(function(payload, metadata) {
    return Promise.all([
        c.call('check-right', 'manage-room', metadata.userId, payload.roomId),
        c.call('is-room-linked-to-team', payload.roomId, payload.teamId)
    ]).then(function() {
        return Promise.all([
            c.call('get-room', payload.roomId),
            c.call('get-team', payload.teamId)
        ]);
    }).then(function(result) {
        return {
            roomId: result[0].roomId,
            roomName: result[0].name,
            teamId: result[1].teamId,
            teamName: result[1].name
        };
    });
}).apply('room-unlinked-to-team');

/* REMOVE */

roomsAgg.when('remove-room').invoke(function(payload, metadata) {
    return c.call('check-right', 'manage-room', metadata.userId, payload.roomId).then(function() {
        return c.call('get-room', payload.roomId);
    }).then(function(room) {
        return {
            roomId: room.roomId,
            name: room.name
        };
    });
}).apply('room-removed');
