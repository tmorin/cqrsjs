var storage = require('../storage').local;
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

function loadData() {
    return JSON.parse(storage.getItem('boards')) || {};
}

function persistData(boards) {
    storage.setItem('boards', JSON.stringify(boards));
}

var boardsAgg = c.aggregate('boards');

boardsAgg.on('board-added').invoke(function(payload) {
    var boards = loadData();
    boards[payload.boardId] = payload;
    persistData(boards);
});

boardsAgg.on('board-details-updated').invoke(function(payload) {
    var boards = loadData();
    boards[payload.boardId].name = payload.name;
    boards[payload.boardId].description = payload.description;
    persistData(boards);
});

boardsAgg.on('board-removed').invoke(function(payload) {
    var boards = loadData();
    delete boards[payload.boardId];
    persistData(boards);
});

/* QUERIES */

c.calling('get-board').invoke(function(roomId, boardId) {
    return Promise.resolve().then(function() {
        var boards = loadData();
        var board = boards[boardId];
        if (!board) {
            throw new Error('unable to find the board: ' + boardId);
        }
        return board;
    });
});

c.calling('list-boards-from-room').invoke(function(roomId) {
    return Promise.resolve().then(function() {
        var boards = loadData();
        return Object.keys(boards).map(function(key) {
            return boards[key];
        }).filter(function(board) {
            return board.roomId === roomId;
        });
    });
});
