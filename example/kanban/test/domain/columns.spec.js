/*globals describe:false, beforeEach:false, afterEach:false, it:false */
/*jshint -W030, browser:false */

var storage = require('../../lib/storage').local;

var cqrs = require('../../../../lib/cqrs');
require('../../lib/domain/columns.handlers');
require('../../lib/domain/columns.repo.local');
require('../../lib/domain/rights.handlers');
require('../../lib/domain/rights.repo.local');

var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var charAsPromised = require('chai-as-promised');

chai.should();
chai.use(sinonChai);
chai.use(charAsPromised);

describe('columns', function() {
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

    describe('add column', function() {
        beforeEach(function() {
            payload = {
                roomId: 'room1',
                boardId: 'board1',
                name: 'column1'
            };
            c.on('column-added').invoke(listener1);
            return c.send('add-column', payload, metadata).should.not.be.rejected;
        });
        it('should publish column added', function() {
            listener1.should.have.been.calledWith(sinon.match.has('columnId')
                .and(sinon.match.has('roomId', 'room1'))
                .and(sinon.match.has('boardId', 'board1'))
                .and(sinon.match.has('name', 'column1')),sinon.match.object);
        });
        it('should save the column', function() {
            var columns = JSON.parse(storage.getItem('columns'));
            Object.keys(columns).should.have.length(1);
        });
    });

    describe('remove column', function() {
        beforeEach(function() {
            storage.setItem('columns', JSON.stringify({
                column1: {
                    roomId: 'room1',
                    boardId: 'board1',
                    columnId: 'column1',
                    name: 'columnName'
                }
            }));
            payload = {
                roomId: 'room1',
                boardId: 'board1',
                columnId: 'column1'
            };
            c.on('column-removed').invoke(listener1);
            return c.send('remove-column', payload, metadata).should.not.be.rejected;
        });
        it('should publish column removed', function() {
            listener1.should.have.been.calledWith(sinon.match.has('columnId', 'column1')
                .and(sinon.match.has('roomId', 'room1'))
                .and(sinon.match.has('boardId', 'board1'))
                .and(sinon.match.has('name', 'columnName')), sinon.match.object);
        });
        it('should delete the column', function() {
            var columns = JSON.parse(storage.getItem('columns'));
            Object.keys(columns).should.have.length(0);
        });
    });

    describe('when board-removed is published', function() {
        beforeEach(function() {
            storage.setItem('columns', JSON.stringify({
                column1: {
                    roomId: 'room1',
                    boardId: 'board1',
                    columnId: 'column1',
                    name: 'columnName'
                }
            }));
            payload = {
                roomId: 'room1',
                boardId: 'board1'
            };
            c.on('column-removed').invoke(listener1);
            return c.publish('board-removed', payload, metadata).should.not.be.rejected;
        });
        it('should publish column removed', function() {
            listener1.should.have.been.calledWith(sinon.match.has('columnId', 'column1')
                .and(sinon.match.has('roomId', 'room1'))
                .and(sinon.match.has('boardId', 'board1'))
                .and(sinon.match.has('name', 'columnName')), sinon.match.object);
        });
        it('should delete the column', function() {
            var columns = JSON.parse(storage.getItem('columns'));
            Object.keys(columns).should.have.length(0);
        });
    });

    describe('update column details', function() {
        beforeEach(function() {
            storage.setItem('columns', JSON.stringify({
                column1: {
                    roomId: 'room1',
                    boardId: 'board1',
                    columnId: 'column1',
                    name: 'name',
                    maxCards: 1
                }
            }));
            payload = {
                roomId: 'room1',
                boardId: 'board1',
                columnId: 'column1',
                name: 'nameBis',
                maxCards: 2
            };
            c.on('column-details-updated').invoke(listener1);
            return c.send('update-column-details', payload, metadata).should.not.be.rejected;
        });
        it('should publish column details updated', function() {
            listener1.should.have.been.calledWith(sinon.match.has('columnId', 'column1')
                .and(sinon.match.has('boardId', 'board1'))
                .and(sinon.match.has('roomId', 'room1'))
                .and(sinon.match.has('name', 'nameBis')).and(
                sinon.match.has('maxCards', 2)), sinon.match.object);
        });
        it('should update the column', function() {
            var columns = JSON.parse(storage.getItem('columns'));
            columns.column1.name.should.eq('nameBis');
            columns.column1.maxCards.should.eq(2);
        });
    });

    describe('update columns order', function() {
        beforeEach(function() {
            storage.setItem('columns', JSON.stringify({
                column1: {
                    roomId: 'room1',
                    boardId: 'board1',
                    columnId: 'column1',
                    name: 'name',
                    order: 0
                },
                column2: {
                    roomId: 'room1',
                    boardId: 'board1',
                    columnId: 'column2',
                    name: 'name',
                    order: 1
                },
                column3: {
                    roomId: 'room1',
                    boardId: 'board1',
                    columnId: 'column3',
                    name: 'name',
                    order: 2
                }
            }));
            payload = {
                roomId: 'room1',
                boardId: 'board1',
                columns: ['column3', 'column1', 'column2']
            };
            c.on('columns-order-updated').invoke(listener1);
            return c.send('update-columns-order', payload, metadata).should.not.be.rejected;
        });
        it('should publish column order updated', function() {
            var payloadMatcher = sinon.match(function (payload) {
                return payload.columns[0].columnId === 'column3' && payload.columns[0].order === 0 &&
                    payload.columns[1].columnId === 'column1' && payload.columns[1].order === 1 &&
                    payload.columns[2].columnId === 'column2' && payload.columns[2].order === 2;
            }, 'payloadMatcher');
            listener1.should.have.been.calledWith(payloadMatcher, sinon.match.object);
        });
        it('should update the columns', function() {
            var columns = JSON.parse(storage.getItem('columns'));
            columns.column1.order.should.eq(1);
            columns.column2.order.should.eq(2);
            columns.column3.order.should.eq(0);
        });
    });

    describe('get existing column', function() {
        beforeEach(function() {
            storage.setItem('columns', JSON.stringify({
                column1: {
                    roomId: 'room1',
                    boardId: 'board1',
                    columnId: 'column1',
                    name: 'name1'
                }
            }));
        });
        it('should get the column', function() {
            return c.call('get-column', 'room1', 'board1', 'column1').should.not.be.rejected;
        });
    });

    describe('get a none existing column', function() {
        it('should not get the column', function() {
            return c.call('get-column', 'room1', 'board1', 'column1').should.be.rejected;
        });
    });

});
/* jshint +W030 */