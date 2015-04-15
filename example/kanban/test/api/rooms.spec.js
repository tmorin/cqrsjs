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

describe('/rooms', function() {

    beforeEach(function() {
        cqrs.debug = false;
        helper.reset();
    });

    afterEach(function() {
        http.close();
    });

    describe('POST /rooms', function() {
        it('should add', function() {
            return chai.request(http).post('/rooms').auth('admin', 'admin').send({
                name: 'new room'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('roomId');
                res.body.should.have.property('name', 'new room');
            });
        });
        it('should not add', function() {
            return chai.request(http).post('/rooms').auth('admin', 'admin').send({
                name: ''
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('GET /rooms/:roomId', function() {
        it('should get', function() {
            return chai.request(http).get('/rooms/room0').auth('admin', 'admin').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('roomId', 'room0');
                res.body.should.have.property('name', 'room0');
            });
        });
        it('should not get', function() {
            return chai.request(http).get('/rooms/none').auth('admin', 'admin').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('PUT /rooms/:roomId/details', function() {
        it('should update', function() {
            return chai.request(http).put('/rooms/room0/details').auth('admin', 'admin').send({
                name: 'roomBis'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('roomId', 'room0');
                res.body.should.have.property('name', 'roomBis');
            });
        });
        it('should not update', function() {
            return chai.request(http).put('/rooms/none/details').auth('admin', 'admin').send({
                name: 'roomBis'
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('DELETE /rooms/:roomId', function() {
        it('should remove', function() {
            return chai.request(http).del('/rooms/room0').auth('admin', 'admin').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('roomId', 'room0');
                res.body.should.have.property('name', 'room0');
            });
        });
        it('should not remove', function() {
            return chai.request(http).del('/rooms/none').auth('admin', 'admin').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('POST /rooms/:roomId/link/:teamId', function() {
        it('should link', function() {
            return chai.request(http).post('/rooms/room1/links/team1').auth('admin', 'admin').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('teamId', 'team1');
                res.body.should.have.property('name', 'team1');
            });
        });
        it('should not link', function() {
            return chai.request(http).post('/rooms/room1/links/none').auth('admin', 'admin').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('DELETE /rooms/:roomId/link/:teamId', function() {
        it('should unlink', function() {
            return chai.request(http).del('/rooms/room0/links/team0').auth('admin', 'admin').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('teamId', 'team0');
                res.body.should.have.property('name', 'team0');
            });
        });
        it('should not unlink', function() {
            return chai.request(http).del('/rooms/room1/links/none').auth('admin', 'admin').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

});
/* jshint +W030 */