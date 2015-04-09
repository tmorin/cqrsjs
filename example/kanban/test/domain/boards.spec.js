/*globals describe:false, beforeEach:false, afterEach:false, it:false */
/*jshint -W030, browser:false */

var storage = require('../../lib/storage').local;

var cqrs = require('../../../../lib/cqrs');
require('../../lib/domain/boards.handlers');
require('../../lib/domain/boards.repo.local');
require('../../lib/domain/rights.handlers');
require('../../lib/domain/rights.repo.local');

var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var charAsPromised = require('chai-as-promised');

chai.should();
chai.use(sinonChai);
chai.use(charAsPromised);

describe('boards', function() {
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

    describe('add board', function() {
        beforeEach(function() {
            payload = {
                roomId: 'room1',
                name: 'board1'
            };
            c.on('board-added').invoke(listener1);
            return c.send('add-board', payload, metadata).should.not.be.rejected;
        });
        it('should publish board added', function() {
            listener1.should.have.been.calledWith(sinon.match.has('boardId').and(sinon.match.has('roomId', 'room1')).and(sinon.match.has('name', 'board1')), sinon.match.object);
        });
        it('should save the board', function() {
            var boards = JSON.parse(storage.getItem('boards'));
            Object.keys(boards).should.have.length(1);
        });
    });

    describe('remove board', function() {
        beforeEach(function() {
            storage.setItem('boards', JSON.stringify({
                boardId: {
                    roomId: 'room1',
                    boardId: 'boardId',
                    name: 'boardName'
                }
            }));
            payload = {
                roomId: 'room1',
                boardId: 'boardId'
            };
            c.on('board-removed').invoke(listener1);
            return c.send('remove-board', payload, metadata).should.not.be.rejected;
        });
        it('should publish board removed', function() {
            listener1.should.have.been.calledWith(sinon.match.has('boardId', 'boardId').and(sinon.match.has('roomId', 'room1')).and(sinon.match.has('name', 'boardName')), sinon.match.object);
        });
        it('should delete the board', function() {
            var boards = JSON.parse(storage.getItem('boards'));
            Object.keys(boards).should.have.length(0);
        });
    });

    describe('when room-removed is published', function() {
        beforeEach(function() {
            storage.setItem('boards', JSON.stringify({
                boardId: {
                    roomId: 'room1',
                    boardId: 'boardId',
                    name: 'boardName'
                }
            }));
            payload = {
                roomId: 'room1'
            };
            c.on('board-removed').invoke(listener1);
            return c.publish('room-removed', payload, metadata).should.not.be.rejected;
        });
        it('should publish board removed', function() {
            listener1.should.have.been.calledWith(sinon.match.has('boardId', 'boardId').and(sinon.match.has('roomId', 'room1')).and(sinon.match.has('name', 'boardName')), sinon.match.object);
        });
        it('should delete the board', function() {
            var boards = JSON.parse(storage.getItem('boards'));
            Object.keys(boards).should.have.length(0);
        });
    });

    describe('update board details', function() {
        beforeEach(function() {
            storage.setItem('boards', JSON.stringify({
                board1: {
                    roomId: 'room1',
                    boardId: 'board1',
                    name: 'name',
                    description: 'description'
                }
            }));
            payload = {
                roomId: 'room1',
                boardId: 'board1',
                name: 'nameBis',
                description: 'descriptionBis'
            };
            c.on('board-details-updated').invoke(listener1);
            return c.send('update-board-details', payload, metadata).should.not.be.rejected;
        });
        it('should publish board details updated', function() {
            listener1.should.have.been.calledWith(sinon.match.has('boardId', 'board1').and(sinon.match.has('roomId', 'room1')).and(sinon.match.has('name', 'nameBis')).and(
                sinon.match.has('description', 'descriptionBis')), sinon.match.object);
        });
        it('should update the board', function() {
            var boards = JSON.parse(storage.getItem('boards'));
            boards.board1.name.should.eq('nameBis');
            boards.board1.description.should.eq('descriptionBis');
        });
    });

    describe('get existing board', function() {
        beforeEach(function() {
            storage.setItem('boards', JSON.stringify({
                board1: {
                    roomId: 'room1',
                    boardId: 'board1',
                    name: 'name1'
                }
            }));
        });
        it('should get the board', function() {
            return c.call('get-board', 'room1', 'board1').should.not.be.rejected;
        });
    });

    describe('get a none existing board', function() {
        it('should not get the board', function() {
            return c.call('get-board', 'room1', 'board1').should.be.rejected;
        });
    });

});
/* jshint +W030 */