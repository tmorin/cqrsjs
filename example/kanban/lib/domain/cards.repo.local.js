var storage = require('../storage').local;
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

function loadData() {
    return JSON.parse(storage.getItem('cards')) || {};
}

function persistData(cards) {
    storage.setItem('cards', JSON.stringify(cards));
}

var cardsAgg = c.aggregate('cards');

cardsAgg.on('card-added').invoke(function(payload) {
    var cards = loadData();
    cards[payload.cardId] = payload;
    persistData(cards);
});

cardsAgg.on('card-details-updated').invoke(function(payload) {
    var cards = loadData();
    cards[payload.cardId].name = payload.name;
    cards[payload.cardId].content = payload.content;
    persistData(cards);
});

cardsAgg.on('card-moved').invoke(function(payload) {
    var cards = loadData();
    cards[payload.cardId].columnId = payload.columnId;
    cards[payload.cardId].order = payload.order;
    persistData(cards);
});

cardsAgg.on('card-assigned').invoke(function(payload) {
    var cards = loadData();
    cards[payload.cardId].assignee = payload.assignee;
    persistData(cards);
});

cardsAgg.on('card-removed').invoke(function(payload) {
    var cards = loadData();
    delete cards[payload.cardId];
    persistData(cards);
});

cardsAgg.on('cards-order-updated').invoke(function(payload) {
    var cards = loadData();
    payload.cards.forEach(function (card) {
        cards[card.cardId].order = card.order;
    });
    persistData(cards);
});

/* QUERIES */

c.calling('get-card').invoke(function(roomId, boardId, columnId, cardId) {
    return Promise.resolve().then(function() {
        var cards = loadData();
        var card = cards[cardId];
        if (!card) {
            throw new Error('unable to find the card: ' + cardId);
        }
        return card;
    });
});

c.calling('list-cards-from-column').invoke(function(roomId, boardId, columnId) {
    return Promise.resolve().then(function() {
        var cards = loadData();
        return Object.keys(cards).map(function(key) {
            return cards[key];
        }).filter(function(card) {
            return card.roomId === roomId && card.boardId === boardId && card.columnId === columnId;
        });
    });
});
