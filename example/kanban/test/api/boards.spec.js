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

describe('/boards', function() {

    beforeEach(function() {
        cqrs.debug = false;
        helper.reset();
    });

    afterEach(function() {
        http.close();
    });

    describe('POST /rooms/:roomId/boards', function() {
        it('should add', function() {
            return chai.request(http).post('/rooms/room0/boards').auth('admin', 'admin').send({
                name: 'new board'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('boardId');
                res.body.should.have.property('name', 'new board');
            });
        });
        it('should not add', function() {
            return chai.request(http).post('/rooms/room0/boards').auth('admin', 'admin').send({
                name: ''
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('GET /rooms/:roomId/boards', function() {
        it('should get', function() {
            return chai.request(http).get('/rooms/room0/boards').auth('admin', 'admin').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.length(2);
                res.body[0].should.have.property('boardId', 'board0');
                res.body[0].should.have.property('name', 'board0');
                res.body[1].should.have.property('boardId', 'board1');
                res.body[1].should.have.property('name', 'board1');
            });
        });
        it('should not get', function() {
            return chai.request(http).get('/rooms/none/boards').auth('admin', 'admin').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('GET /rooms/:roomId/boards/:boardId', function() {
        it('should get', function() {
            return chai.request(http).get('/rooms/room0/boards/board0').auth('admin', 'admin').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('boardId', 'board0');
                res.body.should.have.property('name', 'board0');
            });
        });
        it('should not get', function() {
            return chai.request(http).get('/rooms/room0/boards/none').auth('admin', 'admin').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('PUT /rooms/:roomId/boards/:boardId/details', function() {
        it('should update', function() {
            return chai.request(http).put('/rooms/room0/boards/board0/details').auth('admin', 'admin').send({
                name: 'boardBis'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('boardId', 'board0');
                res.body.should.have.property('name', 'boardBis');
            });
        });
        it('should not update', function() {
            return chai.request(http).put('/rooms/room0/boards/none/details').auth('admin', 'admin').send({
                name: 'boardBis'
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('DELETE /rooms/:roomId/boards/:boardId', function() {
        it('should remove', function() {
            return chai.request(http).del('/rooms/room0/boards/board0').auth('admin', 'admin').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('boardId', 'board0');
                res.body.should.have.property('name', 'board0');
            });
        });
        it('should not remove', function() {
            return chai.request(http).del('/rooms/room0/boards/none').auth('admin', 'admin').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

});
/* jshint +W030 */