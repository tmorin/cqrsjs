var t = require('tcomb');
var uuid = require('uuid');
var cqrs = require('../../../lib/cqrs');
var c = cqrs();

var boardsAgg = c.aggregate('boards');

/* ADD */

var BoardAdded = t.struct({
    roomId: t.Str,
    boardId: t.Str,
    name: t.Str
}, 'BoardAdded');

boardsAgg.when('add-board').invoke(function(payload, metadata) {
    return cqrs().call('check-right', 'manage-boards', metadata.userId, payload.roomId).then(function() {
        return new BoardAdded({
            roomId: payload.roomId,
            boardId: uuid.v4(),
            name: payload.name
        });
    });
}).apply('board-added');

/* UPDATE DETAILS */

var BoardDetailsUpdated = t.struct({
    roomId: t.Str,
    boardId: t.Str,
    name: t.Str,
    description: t.Str
}, 'BoardDetailsUpdated');

boardsAgg.when('update-board-details').invoke(function(payload, metadata) {
    return cqrs().call('check-right', 'manage-boards', metadata.userId, payload.roomId).then(function() {
        return new BoardDetailsUpdated({
            roomId: payload.roomId,
            boardId: payload.boardId,
            name: payload.name,
            description: payload.description
        });
    });
}).apply('board-details-updated');

/* REMOVE */

var BoardRemoved = t.struct({
    roomId: t.Str,
    boardId: t.Str,
    name: t.Str
}, 'BoardRemoved');

boardsAgg.when('remove-board').invoke(function(payload, metadata) {
    return cqrs().call('check-right', 'manage-boards', metadata.userId, payload.roomId).then(function() {
        return cqrs().call('get-board', payload.roomId, payload.boardId);
    }).then(function(board) {
        return new BoardRemoved({
            roomId: payload.roomId,
            boardId: board.boardId,
            name: board.name
        });
    });
}).apply('board-removed');

/* REMOVE WHEN ROOM REMOVED*/

boardsAgg.when('room-removed').invoke(function(payload) {
    return cqrs().call('list-boards-from-room', payload.roomId).then(function(boards) {
        return boards.map(function(board) {
            return new BoardRemoved({
                roomId: payload.roomId,
                boardId: board.boardId,
                name: board.name
            })
        });
    });
}).forEach().apply('board-removed');