var t = require('tcomb');
var uuid = require('uuid');
var cqrs = require('../../../lib/cqrs');
var c = cqrs();

var boardsAgg = c.aggregate('boards')

boardsAgg.on('board-added').invoke(function(payload) {
    var boards = JSONStorage.getItem('boards') || {};
    boards[payload.boardId] = payload;
    JSONStorage.setItem('boards', boards);
});

boardsAgg.on('board-details-updated').invoke(function(payload) {
    var boards = JSONStorage.getItem('boards') || [];
    boards[payload.boardId].name = payload.name;
    boards[payload.boardId].description = payload.description;
    JSONStorage.setItem('boards', boards);
});

boardsAgg.on('board-removed').invoke(function(payload) {
    var boards = JSONStorage.getItem('boards') || [];
    delete boards[payload.boardId];
    JSONStorage.setItem('boards', boards);
});
