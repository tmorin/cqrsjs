var cqrs = require('../../../../lib/cqrs');
var io = require('../server').io;

var EVENTS = [
    'board-details-updated',
    'board-removed',
    'column-added',
    'column-details-updated',
    'column-removed',
    'columns-order-updated',
    'card-added',
    'card-details-updated',
    'card-moved',
    'card-assigned',
    'card-removed',
    'cards-order-updated'
];

var boardsNsp = io.of('/boards');

var c = cqrs();
EVENTS.forEach(function(event) {
    c.on(event).invoke(function(payload, metadata) {
        boardsNsp.to(payload.boardId).emit(event, {
            payload: payload,
            metadata: metadata
        });
    });
});

boardsNsp.on('connection', function(socket) {

    socket.on('subscribe', function(boardId, done) {
        socket.join(boardId);
        done();
    });

    socket.on('unsubscribe', function(boardId, done) {
        socket.leave(boardId);
        done();
    });

    socket.on('disconnect', function() {
    });

});