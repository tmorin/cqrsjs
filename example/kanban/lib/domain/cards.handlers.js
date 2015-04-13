var uuid = require('uuid');
var chai = require('chai');
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

var cardsAgg = c.aggregate('cards');

/* ADD */

cardsAgg.when('add-card').invoke(function(payload, metadata) {
    chai.assert.ok(payload.roomId, 'roomId is required');
    chai.assert.ok(payload.boardId, 'boardId is required');
    chai.assert.ok(payload.columnId, 'columnId is required');
    chai.assert.ok(payload.name, 'name is required');
    return cqrs().call('check-right', 'manage-cards', metadata.userId, payload.roomId, payload.boardId, payload.columnId).then(function() {
        return {
            roomId: payload.roomId,
            boardId: payload.boardId,
            columnId: payload.columnId,
            cardId: uuid.v4(),
            name: payload.name
        };
    });
}).apply('card-added');

/* UPDATE DETAILS */

cardsAgg.when('update-card-details').invoke(function(payload, metadata) {
    chai.assert.ok(payload.roomId, 'roomId is required');
    chai.assert.ok(payload.boardId, 'boardId is required');
    chai.assert.ok(payload.columnId, 'columnId is required');
    chai.assert.ok(payload.cardId, 'cardId is required');
    chai.assert.ok(payload.name, 'name is required');
    return cqrs().call('check-right', 'manage-card', metadata.userId, payload.roomId, payload.boardId, payload.columnId, payload.cardId).then(function() {
        return {
            roomId: payload.roomId,
            boardId: payload.boardId,
            columnId: payload.columnId,
            cardId: payload.cardId,
            name: payload.name,
            content: payload.content
        };
    });
}).apply('card-details-updated');

/* MOVE */

cardsAgg.when('move-card').invoke(function(payload, metadata) {
    chai.assert.ok(payload.roomId, 'roomId is required');
    chai.assert.ok(payload.boardId, 'boardId is required');
    chai.assert.ok(payload.columnId, 'columnId is required');
    chai.assert.ok(payload.cardId, 'cardId is required');
    chai.assert.ok(payload.nextColumnId, 'nextColumnId is required');
    return cqrs().call('check-right', 'manage-card', metadata.userId, payload.roomId, payload.boardId, payload.columnId, payload.cardId).then(function() {
        return cqrs().call('get-card', payload.roomId, payload.boardId, payload.columnId, payload.cardId);
    }).then(function(card) {
        return {
            roomId: card.roomId,
            boardId: card.boardId,
            columnId: payload.nextColumnId,
            previousColumnId: card.columnId,
            cardId: card.cardId,
            name: card.name
        };
    });
}).apply('card-moved');

/* ASSIGN CARD */

cardsAgg.when('assign-card').invoke(function(payload, metadata) {
    chai.assert.ok(payload.roomId, 'roomId is required');
    chai.assert.ok(payload.boardId, 'boardId is required');
    chai.assert.ok(payload.columnId, 'columnId is required');
    chai.assert.ok(payload.cardId, 'cardId is required');
    chai.assert.ok(payload.personId, 'personId is required');
    return cqrs().call('check-right', 'manage-card', metadata.userId, payload.roomId, payload.boardId, payload.columnId, payload.cardId).then(function() {
        return Promise.all([
            cqrs().call('get-card', payload.roomId, payload.boardId, payload.columnId, payload.cardId),
            cqrs().call('get-person', payload.personId)
        ]);
    }).then(function(result) {
        return {
            roomId: result[0].roomId,
            boardId: result[0].boardId,
            columnId: result[0].columnId,
            cardId: result[0].cardId,
            name: result[0].name,
            assignee: result[1].personId,
            assigneeName: result[1].name
        };
    });
}).apply('card-assigned');

/* UNASSIGN CARD */

cardsAgg.when('unassign-card').invoke(function(payload, metadata) {
    chai.assert.ok(payload.roomId, 'roomId is required');
    chai.assert.ok(payload.boardId, 'boardId is required');
    chai.assert.ok(payload.columnId, 'columnId is required');
    chai.assert.ok(payload.cardId, 'cardId is required');
    return cqrs().call('check-right', 'manage-card', metadata.userId, payload.roomId, payload.boardId, payload.columnId, payload.cardId).then(function() {
        return cqrs().call('get-card', payload.roomId, payload.boardId, payload.columnId, payload.cardId);
    }).then(function(card) {
        return {
            roomId: card.roomId,
            boardId: card.boardId,
            columnId: card.columnId,
            cardId: card.cardId,
            name: card.name,
            assignee: null,
            assigneeName: ''
        };
    });
}).apply('card-assigned');

/* REMOVE */

cardsAgg.when('remove-card').invoke(function(payload, metadata) {
    chai.assert.ok(payload.roomId, 'roomId is required');
    chai.assert.ok(payload.boardId, 'boardId is required');
    chai.assert.ok(payload.columnId, 'columnId is required');
    chai.assert.ok(payload.cardId, 'cardId is required');
    return cqrs().call('check-right', 'manage-card', metadata.userId, payload.roomId, payload.boardId, payload.columnId, payload.cardId).then(function() {
        return cqrs().call('get-card', payload.roomId, payload.boardId, payload.columnId, payload.cardId);
    }).then(function(card) {
        return {
            roomId: payload.roomId,
            boardId: payload.boardId,
            columnId: payload.columnId,
            cardId: card.cardId,
            name: card.name
        };
    });
}).apply('card-removed');

/* REMOVE WHEN COLUMN REMOVED */

cardsAgg.when('column-removed').invoke(function(payload) {
    return cqrs().call('list-cards-from-column', payload.roomId, payload.boardId, payload.columnId).then(function(cards) {
        return cards.map(function(card) {
            return {
                roomId: payload.roomId,
                boardId: payload.boardId,
                columnId: payload.columnId,
                cardId: card.cardId,
                name: card.name
            };
        });
    });
}).forEach().apply('card-removed');