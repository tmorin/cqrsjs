/*globals describe:false, beforeEach:false, afterEach:false, it:false */
/*jshint -W030, browser:false */

var storage = require('../../lib/storage').local;

var cqrs = require('../../../../lib/cqrs');
require('../../lib/domain/cards.handlers');
require('../../lib/domain/cards.repo.local');
require('../../lib/domain/rights.handlers');
require('../../lib/domain/rights.repo.local');

var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var charAsPromised = require('chai-as-promised');

chai.should();
chai.use(sinonChai);
chai.use(charAsPromised);

describe('cards', function() {
    var c, payload, metadata, listener1;

    beforeEach(function() {
        cqrs.debug = false;
        storage.clear();
        storage.setItem('rights', JSON.stringify({
            person1: {
                personId: 'person1',
                roles: ['admin']
            }
        }));
        metadata = {
            userId: 'person1'
        };
        c = cqrs();
        listener1 = sinon.spy();
    });

    afterEach(function() {
        c.destroy();
    });

    describe('add card', function() {
        beforeEach(function() {
            payload = {
                roomId: 'room1',
                boardId: 'board1',
                columnId: 'column1',
                name: 'card1'
            };
            c.on('card-added').invoke(listener1);
            return c.send('add-card', payload, metadata).should.not.be.rejected;
        });
        it('should publish card added', function() {
            listener1.should.have.been.calledWith(sinon.match.has('cardId')
                .and(sinon.match.has('roomId', 'room1'))
                .and(sinon.match.has('boardId', 'board1'))
                .and(sinon.match.has('columnId', 'column1'))
                .and(sinon.match.has('name', 'card1')),sinon.match.object);
        });
        it('should save the card', function() {
            var cards = JSON.parse(storage.getItem('cards'));
            Object.keys(cards).should.have.length(1);
        });
    });

    describe('remove card', function() {
        beforeEach(function() {
            storage.setItem('cards', JSON.stringify({
                card1: {
                    roomId: 'room1',
                    boardId: 'board1',
                    columnId: 'column1',
                    cardId: 'card1',
                    name: 'cardName'
                }
            }));
            payload = {
                roomId: 'room1',
                boardId: 'board1',
                columnId: 'column1',
                cardId: 'card1'
            };
            c.on('card-removed').invoke(listener1);
            return c.send('remove-card', payload, metadata).should.not.be.rejected;
        });
        it('should publish card removed', function() {
            listener1.should.have.been.calledWith(sinon.match.has('cardId', 'card1')
                .and(sinon.match.has('roomId', 'room1'))
                .and(sinon.match.has('boardId', 'board1'))
                .and(sinon.match.has('columnId', 'column1'))
                .and(sinon.match.has('name', 'cardName')), sinon.match.object);
        });
        it('should delete the card', function() {
            var cards = JSON.parse(storage.getItem('cards'));
            Object.keys(cards).should.have.length(0);
        });
    });

    describe('when column-removed is published', function() {
        beforeEach(function() {
            storage.setItem('cards', JSON.stringify({
                card1: {
                    roomId: 'room1',
                    boardId: 'board1',
                    columnId: 'column1',
                    cardId: 'card1',
                    name: 'cardName'
                }
            }));
            payload = {
                roomId: 'room1',
                boardId: 'board1',
                columnId: 'column1'
            };
            c.on('card-removed').invoke(listener1);
            return c.publish('column-removed', payload, metadata).should.not.be.rejected;
        });
        it('should publish card removed', function() {
            listener1.should.have.been.calledWith(sinon.match.has('cardId', 'card1')
                .and(sinon.match.has('roomId', 'room1'))
                .and(sinon.match.has('boardId', 'board1'))
                .and(sinon.match.has('columnId', 'column1'))
                .and(sinon.match.has('name', 'cardName')), sinon.match.object);
        });
        it('should delete the card', function() {
            var cards = JSON.parse(storage.getItem('cards'));
            Object.keys(cards).should.have.length(0);
        });
    });

    describe('update card details', function() {
        beforeEach(function() {
            storage.setItem('cards', JSON.stringify({
                card1: {
                    roomId: 'room1',
                    boardId: 'board1',
                    columnId: 'column1',
                    cardId: 'card1',
                    name: 'name',
                    content: 'content'
                }
            }));
            payload = {
                roomId: 'room1',
                boardId: 'board1',
                columnId: 'column1',
                cardId: 'card1',
                name: 'nameBis',
                content: 'contentBis'
            };
            c.on('card-details-updated').invoke(listener1);
            return c.send('update-card-details', payload, metadata).should.not.be.rejected;
        });
        it('should publish card details updated', function() {
            listener1.should.have.been.calledWith(sinon.match.has('cardId', 'card1')
                .and(sinon.match.has('boardId', 'board1'))
                .and(sinon.match.has('roomId', 'room1'))
                .and(sinon.match.has('columnId', 'column1'))
                .and(sinon.match.has('name', 'nameBis')).and(
                sinon.match.has('content', 'contentBis')), sinon.match.object);
        });
        it('should update the card', function() {
            var cards = JSON.parse(storage.getItem('cards'));
            cards.card1.name.should.eq('nameBis');
            cards.card1.content.should.eq('contentBis');
        });
    });

    describe('move card', function() {
        beforeEach(function() {
            storage.setItem('cards', JSON.stringify({
                card1: {
                    roomId: 'room1',
                    boardId: 'board1',
                    columnId: 'column1',
                    cardId: 'card1',
                    name:'card1'
                }
            }));
            payload = {
                roomId: 'room1',
                boardId: 'board1',
                columnId: 'column1',
                cardId: 'card1',
                nextColumnId: 'column2'
            };
            c.on('card-moved').invoke(listener1);
            return c.send('move-card', payload, metadata).should.not.be.rejected;
        });
        it('should publish card moved', function() {
            listener1.should.have.been.calledWith(sinon.match.has('cardId', 'card1')
                .and(sinon.match.has('boardId', 'board1'))
                .and(sinon.match.has('roomId', 'room1'))
                .and(sinon.match.has('columnId', 'column2'))
                .and(sinon.match.has('previousColumnId', 'column1'))
                .and(sinon.match.has('order', 0))
                .and(sinon.match.has('name', 'card1')), sinon.match.object);
        });
        it('should update the cards', function() {
            var cards = JSON.parse(storage.getItem('cards'));
            cards.card1.columnId.should.eq('column2');
            cards.card1.order.should.eq(0);
        });
    });

    describe('assign card details', function() {
        beforeEach(function() {
            storage.setItem('cards', JSON.stringify({
                card1: {
                    roomId: 'room1',
                    boardId: 'board1',
                    columnId: 'column1',
                    cardId: 'card1',
                    name: 'card1',
                    content: 'content'
                }
            }));
            storage.setItem('persons', JSON.stringify({
                person1: {
                    personId: 'person1',
                    name: 'person1'
                }
            }));
            payload = {
                roomId: 'room1',
                boardId: 'board1',
                columnId: 'column1',
                cardId: 'card1',
                personId: 'person1'
            };
            c.on('card-assigned').invoke(listener1);
            return c.send('assign-card', payload, metadata).should.not.be.rejected;
        });
        it('should publish card details updated', function() {
            listener1.should.have.been.calledWith(sinon.match.has('cardId', 'card1')
                .and(sinon.match.has('boardId', 'board1'))
                .and(sinon.match.has('roomId', 'room1'))
                .and(sinon.match.has('columnId', 'column1'))
                .and(sinon.match.has('assignee', 'person1'))
                .and(sinon.match.has('assigneeName', 'person1'))
                .and(sinon.match.has('name', 'card1')), sinon.match.object);
        });
        it('should update the card', function() {
            var cards = JSON.parse(storage.getItem('cards'));
            cards.card1.assignee.should.eq('person1');
        });
    });

    describe('unassign card details', function() {
        beforeEach(function() {
            storage.setItem('cards', JSON.stringify({
                card1: {
                    roomId: 'room1',
                    boardId: 'board1',
                    columnId: 'column1',
                    cardId: 'card1',
                    name: 'card1',
                    content: 'content'
                }
            }));
            storage.setItem('persons', JSON.stringify({
                person1: {
                    personId: 'person1',
                    name: 'person1'
                }
            }));
            payload = {
                roomId: 'room1',
                boardId: 'board1',
                columnId: 'column1',
                cardId: 'card1',
                personId: 'person1'
            };
            c.on('card-assigned').invoke(listener1);
            return c.send('unassign-card', payload, metadata).should.not.be.rejected;
        });
        it('should publish card details updated', function() {
            listener1.should.have.been.calledWith(sinon.match.has('cardId', 'card1')
                .and(sinon.match.has('boardId', 'board1'))
                .and(sinon.match.has('roomId', 'room1'))
                .and(sinon.match.has('columnId', 'column1'))
                .and(sinon.match.has('name', 'card1')), sinon.match.object);
        });
        it('should update the card', function() {
            var cards = JSON.parse(storage.getItem('cards'));
            cards.card1.should.have.property('assignee', null);
        });
    });

    describe('get existing card', function() {
        beforeEach(function() {
            storage.setItem('cards', JSON.stringify({
                card1: {
                    roomId: 'room1',
                    boardId: 'board1',
                    columnId: 'column1',
                    cardId: 'card1',
                    name: 'name1'
                }
            }));
        });
        it('should get the card', function() {
            return c.call('get-card', 'room1', 'board1', 'columnId', 'card1').should.not.be.rejected;
        });
    });

    describe('get a none existing card', function() {
        it('should not get the card', function() {
            return c.call('get-card', 'room1', 'board1', 'columnId', 'card1').should.be.rejected;
        });
    });

    describe('update cards order', function() {
        beforeEach(function() {
            storage.setItem('cards', JSON.stringify({
                card1: {
                    roomId: 'room1',
                    boardId: 'board1',
                    columnId: 'column1',
                    cardId: 'card1',
                    name: 'name',
                    order: 0
                },
                card2: {
                    roomId: 'room1',
                    boardId: 'board1',
                    columnId: 'column1',
                    cardId: 'card2',
                    name: 'name',
                    order: 1
                },
                card3: {
                    roomId: 'room1',
                    boardId: 'board1',
                    columnId: 'column1',
                    cardId: 'card3',
                    name: 'name',
                    order: 2
                }
            }));
            payload = {
                roomId: 'room1',
                boardId: 'board1',
                columnId: 'column1',
                cards: ['card3', 'card1', 'card2']
            };
            c.on('cards-order-updated').invoke(listener1);
            return c.send('update-cards-order', payload, metadata).should.not.be.rejected;
        });
        it('should publish cards order updated', function() {
            var payloadMatcher = sinon.match(function (payload) {
                return payload.cards[0].cardId === 'card3' && payload.cards[0].order === 0 &&
                    payload.cards[1].cardId === 'card1' && payload.cards[1].order === 1 &&
                    payload.cards[2].cardId === 'card2' && payload.cards[2].order === 2;
            }, 'payloadMatcher');
            listener1.should.have.been.calledWith(payloadMatcher, sinon.match.object);
        });
        it('should update the cards', function() {
            var cards = JSON.parse(storage.getItem('cards'));
            cards.card1.order.should.eq(1);
            cards.card2.order.should.eq(2);
            cards.card3.order.should.eq(0);
        });
    });

});
/* jshint +W030 */