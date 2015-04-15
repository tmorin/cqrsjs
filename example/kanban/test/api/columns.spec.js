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

    describe('POST /rooms/:roomId/boards/:board/columns', function() {
        it('should add', function() {
            return chai.request(http).post('/rooms/room0/boards/board0/columns').auth('admin', 'admin').send({
                name: 'new board'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('boardId', 'board0');
                res.body.should.have.property('columnId');
                res.body.should.have.property('name', 'new board');
            });
        });
        it('should not add', function() {
            return chai.request(http).post('/rooms/room0/boards/none/columns').auth('admin', 'admin').send({
                name: ''
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('GET /rooms/:roomId/boards/:board/columns', function() {
        it('should get', function() {
            return chai.request(http).get('/rooms/room0/boards/board0/columns').auth('admin', 'admin').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.length(2);
                res.body[0].should.have.property('columnId', 'column0');
                res.body[0].should.have.property('name', 'column0');
                res.body[1].should.have.property('columnId', 'column1');
                res.body[1].should.have.property('name', 'column1');
            });
        });
        it('should not get', function() {
            return chai.request(http).get('/rooms/none/boards/none/columns').auth('admin', 'admin').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('GET /rooms/:roomId/boards/:boardId/columns/:columnId', function() {
        it('should get', function() {
            return chai.request(http).get('/rooms/room0/boards/board0/columns/column0').auth('admin', 'admin').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('boardId', 'board0');
                res.body.should.have.property('columnId', 'column0');
                res.body.should.have.property('name', 'column0');
            });
        });
        it('should not get', function() {
            return chai.request(http).get('/rooms/room0/boards/board0/columns/none').auth('admin', 'admin').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('PUT /rooms/:roomId/boards/:boardId/columns/:columnId/details', function() {
        it('should update', function() {
            return chai.request(http).put('/rooms/room0/boards/board0/columns/column0/details').auth('admin', 'admin').send({
                name: 'columnBis'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('boardId', 'board0');
                res.body.should.have.property('columnId', 'column0');
                res.body.should.have.property('name', 'columnBis');
            });
        });
        it('should not update', function() {
            return chai.request(http).put('/rooms/room0/boards/none/columns/none/details').auth('admin', 'admin').send({
                name: 'boardBis'
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('PUT /rooms/:roomId/boards/:boardId/columns/order', function() {
        it('should order', function() {
            return chai.request(http).put('/rooms/room0/boards/board0/columns/order').auth('admin', 'admin').send({
                columns: ['column1', 'column0']
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.length(2);
                res.body[0].should.have.property('columnId', 'column1');
                res.body[1].should.have.property('columnId', 'column0');
            });
        });
        it('should not order', function() {
            return chai.request(http).put('/rooms/room0/boards/none/columns/order').auth('admin', 'admin').send({
                order: ['column1', 'column0']
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('DELETE /rooms/:roomId/boards/:boardId/columns/:columnId', function() {
        it('should remove', function() {
            return chai.request(http).del('/rooms/room0/boards/board0/columns/column0').auth('admin', 'admin').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('boardId', 'board0');
                res.body.should.have.property('columnId', 'column0');
                res.body.should.have.property('name', 'column0');
            });
        });
        it('should not remove', function() {
            return chai.request(http).del('/rooms/room0/boards/board0/columns/none').auth('admin', 'admin').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

});
/* jshint +W030 */