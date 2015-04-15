/*globals describe:false, beforeEach:false, afterEach:false, it:false */
/*jshint -W030, browser:false */

var helper = require('../helper');
var cqrs = require('../../../../lib/cqrs');
var http = require('../../lib/server').http;
require('../../lib/api/main');
require('../../lib/domain/main');

var chai = require('chai');
var sinonChai = require('sinon-chai');
var charAsPromised = require('chai-as-promised');
var chaiHttp = require('chai-http');

chai.should();
chai.use(sinonChai);
chai.use(charAsPromised);
chai.use(chaiHttp);

describe('/columns', function() {

    beforeEach(function() {
        cqrs.debug = false;
        helper.reset();
    });

    afterEach(function() {
        http.close();
    });

    describe('POST /rooms/:roomId/boards/:board/columns/:column/cards', function() {
        it('should add', function() {
            return chai.request(http).post('/rooms/room0/boards/board0/columns/column0/cards').auth('admin', 'admin').send({
                name: 'new board'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('boardId', 'board0');
                res.body.should.have.property('columnId');
                res.body.should.have.property('name', 'new board');
            });
        });
        it('should not add', function() {
            return chai.request(http).post('/rooms/room0/boards/board0/columns/none/cards').auth('admin', 'admin').send({
                name: ''
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('GET /rooms/:roomId/boards/:board/columns/:column/cards', function() {
        it('should get', function() {
            return chai.request(http).get('/rooms/room0/boards/board0/columns/column0/cards').auth('admin', 'admin').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.length(2);
                res.body[0].should.have.property('cardId', 'card0');
                res.body[0].should.have.property('name', 'card0');
                res.body[1].should.have.property('cardId', 'card1');
                res.body[1].should.have.property('name', 'card1');
            });
        });
        it('should not get', function() {
            return chai.request(http).get('/rooms/none/boards/none/columns/none/cards').auth('admin', 'admin').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('GET /rooms/:roomId/boards/:boardId/columns/:columnId/:column/cards/:cardId', function() {
        it('should get', function() {
            return chai.request(http).get('/rooms/room0/boards/board0/columns/column0/cards/card0').auth('admin', 'admin').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('boardId', 'board0');
                res.body.should.have.property('columnId', 'column0');
                res.body.should.have.property('cardId', 'card0');
                res.body.should.have.property('name', 'card0');
            });
        });
        it('should not get', function() {
            return chai.request(http).get('/rooms/room0/boards/board0/columns/column0/cards/none').auth('admin', 'admin').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('PUT /rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId/details', function() {
        it('should update', function() {
            return chai.request(http).put('/rooms/room0/boards/board0/columns/column0/cards/card0/details').auth('admin', 'admin').send({
                name: 'columnBis'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('boardId', 'board0');
                res.body.should.have.property('columnId', 'column0');
                res.body.should.have.property('name', 'columnBis');
            });
        });
        it('should not update', function() {
            return chai.request(http).put('/rooms/room0/boards/none/columns/column0/cards/none/details').auth('admin', 'admin').send({
                name: 'boardBis'
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('DELETE /rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId', function() {
        it('should remove', function() {
            return chai.request(http).del('/rooms/room0/boards/board0/columns/column0/cards/card0').auth('admin', 'admin').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('boardId', 'board0');
                res.body.should.have.property('columnId', 'column0');
                res.body.should.have.property('cardId', 'card0');
                res.body.should.have.property('name', 'card0');
            });
        });
        it('should not remove', function() {
            return chai.request(http).del('/rooms/room0/boards/board0/columns/column0/cards/none').auth('admin', 'admin').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('PUT /rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId/assign', function() {
        it('should assign', function() {
            return chai.request(http).put('/rooms/room0/boards/board0/columns/column0/cards/card0/assign').auth('admin', 'admin').send({
                personId: 'person1'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('boardId', 'board0');
                res.body.should.have.property('columnId', 'column0');
                res.body.should.have.property('cardId', 'card0');
                res.body.should.have.property('assignee', 'person1');
                res.body.should.have.property('assigneeName', 'person1');
            });
        });
        it('should not assign', function() {
            return chai.request(http).put('/rooms/room0/boards/none/columns/column0/cards/none/assign').auth('admin', 'admin').send({
                personId: 'person1'
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('DELETE /rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId/assign', function() {
        it('should unassign', function() {
            return chai.request(http).del('/rooms/room0/boards/board0/columns/column0/cards/card1/assign').auth('admin', 'admin').send({
                personId: 'person1'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('boardId', 'board0');
                res.body.should.have.property('columnId', 'column0');
                res.body.should.have.property('cardId', 'card1');
                res.body.should.have.property('assignee', null);
                res.body.should.have.property('assigneeName', '');
            });
        });
        it('should not unassign', function() {
            return chai.request(http).del('/rooms/room0/boards/none/columns/column0/cards/none/assign').auth('admin', 'admin').send({
                personId: 'person1'
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('PUT /rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId/move', function() {
        it('should assign', function() {
            return chai.request(http).put('/rooms/room0/boards/board0/columns/column0/cards/card0/move').auth('admin', 'admin').send({
                nextColumnId: 'column1'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('boardId', 'board0');
                res.body.should.have.property('columnId', 'column1');
                res.body.should.have.property('cardId', 'card0');
            });
        });
        it('should not assign', function() {
            return chai.request(http).put('/rooms/room0/boards/none/columns/column0/cards/none/move').auth('admin', 'admin').send({
                nextColumnId: 'column1'
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('PUT /rooms/:roomId/boards/:boardId/columns/:columnId/cards/order', function() {
        it('should order', function() {
            return chai.request(http).put('/rooms/room0/boards/board0/columns/column0/cards/order').auth('admin', 'admin').send({
                cards: ['card1', 'card0']
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.length(2);
                res.body[0].should.have.property('cardId', 'card1');
                res.body[1].should.have.property('cardId', 'card0');
            });
        });
        it('should not order', function() {
            return chai.request(http).put('/rooms/room0/boards/board0/columns/none/cards/order').auth('admin', 'admin').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

});
/* jshint +W030 */