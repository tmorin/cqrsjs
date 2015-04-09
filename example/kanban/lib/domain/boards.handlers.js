var uuid = require('uuid');
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

var boardsAgg = c.aggregate('boards');

/* ADD */

boardsAgg.when('add-board').invoke(function(payload, metadata) {
    return cqrs().call('check-right', 'manage-boards', metadata.userId, payload.roomId).then(function() {
        return {
            roomId: payload.roomId,
            boardId: uuid.v4(),
            name: payload.name
        };
    });
}).apply('board-added');

/* UPDATE DETAILS */

boardsAgg.when('update-board-details').invoke(function(payload, metadata) {
    return cqrs().call('check-right', 'manage-board', metadata.userId, payload.roomId, payload.boardId).then(function() {
        return {
            roomId: payload.roomId,
            boardId: payload.boardId,
            name: payload.name,
            description: payload.description
        };
    });
}).apply('board-details-updated');

/* REMOVE */

boardsAgg.when('remove-board').invoke(function(payload, metadata) {
    return cqrs().call('check-right', 'manage-board', metadata.userId, payload.roomId, payload.boardId).then(function() {
        return cqrs().call('get-board', payload.roomId, payload.boardId);
    }).then(function(board) {
        return {
            roomId: board.roomId,
            boardId: board.boardId,
            name: board.name
        };
    });
}).apply('board-removed');

/* REMOVE WHEN ROOM REMOVED */

boardsAgg.when('room-removed').invoke(function(payload) {
    return cqrs().call('list-boards-from-room', payload.roomId).then(function(boards) {
        return boards.map(function(board) {
            return {
                roomId: board.roomId,
                boardId: board.boardId,
                name: board.name
            };
        });
    });
}).forEach().apply('board-removed');