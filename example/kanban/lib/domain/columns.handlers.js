var uuid = require('uuid');
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

var columnsAgg = c.aggregate('columns');

/* ADD */

columnsAgg.when('add-column').invoke(function(payload, metadata) {
    return cqrs().call('check-right', 'manage-columns', metadata.userId, payload.roomId, payload.boardId).then(function() {
        return cqrs().call('list-columns-from-board', payload.roomId, payload.boardId);
    }).then(function(columns) {
        return {
            roomId: payload.roomId,
            boardId: payload.boardId,
            columnId: uuid.v4(),
            name: payload.name,
            order: columns.indexOf(columns.length - 1).order || 0
        };
    });
}).apply('column-added');

/* UPDATE DETAILS */

columnsAgg.when('update-column-details').invoke(function(payload, metadata) {
    return cqrs().call('check-right', 'manage-column', metadata.userId, payload.roomId, payload.boardId, payload.columnId).then(function() {
        return {
            roomId: payload.roomId,
            boardId: payload.boardId,
            columnId: payload.columnId,
            name: payload.name,
            maxCards: payload.maxCards
        };
    });
}).apply('column-details-updated');

/* REMOVE */

columnsAgg.when('remove-column').invoke(function(payload, metadata) {
    return cqrs().call('check-right', 'manage-column', metadata.userId, payload.roomId, payload.boardId, payload.columnId).then(function() {
        return cqrs().call('get-column', payload.roomId, payload.boardId, payload.columnId);
    }).then(function(column) {
        return {
            roomId: payload.roomId,
            boardId: payload.boardId,
            columnId: column.columnId,
            name: column.name
        };
    });
}).apply('column-removed');

/* UPDATE COLUMNS ORDER */

columnsAgg.when('update-columns-order').invoke(function(payload, metadata) {
    return cqrs().call('check-right', 'manage-column', metadata.userId, payload.roomId, payload.boardId, payload.columnId).then(function() {
        return cqrs().call('list-columns-from-board', payload.roomId, payload.boardId);
    }).then(function(columns) {
        return columns.map(function (column) {
            return {
                roomId: payload.roomId,
                boardId: payload.boardId,
                columnId: column.columnId,
                name: column.name,
                order: payload.columns.indexOf(column.columnId)
            };
        }).sort(function (a, b) {
            return a.order - b.order;
        }).reduce(function (a, b) {
            a.columns.push(b);
            return a;
        }, {
            roomId: payload.roomId,
            boardId: payload.boardId,
            columns: []
        });
    });
}).apply('columns-order-updated');

/* REMOVE WHEN BOARD REMOVED */

columnsAgg.when('board-removed').invoke(function(payload) {
    return cqrs().call('list-columns-from-board', payload.roomId, payload.boardId).then(function(columns) {
        return columns.map(function(column) {
            return {
                roomId: payload.roomId,
                boardId: payload.boardId,
                columnId: column.columnId,
                name: column.name
            };
        });
    });
}).forEach().apply('column-removed');