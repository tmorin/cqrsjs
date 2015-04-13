/*globals describe:false, beforeEach:false, afterEach:false, it:false */
/*jshint -W030, browser:false */

var helper = require('./helper');
var cqrs = require('../../../../lib/cqrs');
var server = require('../../lib/server');
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
        server.close();
    });

    describe('POST /rooms', function() {
        it('should add', function() {
            return chai.request(server).post('/rooms').send({
                name: 'new room'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('roomId');
                res.body.should.have.property('name', 'new room');
            });
        });
        it('should not add', function() {
            return chai.request(server).post('/rooms').send({
                name: ''
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('GET /rooms/:roomId', function() {
        it('should get', function() {
            return chai.request(server).get('/rooms/room0').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('roomId', 'room0');
                res.body.should.have.property('name', 'room0');
            });
        });
        it('should not get', function() {
            return chai.request(server).get('/rooms/none').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('PUT /rooms/:roomId/details', function() {
        it('should update', function() {
            return chai.request(server).put('/rooms/room0/details').send({
                name: 'roomBis'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('roomId', 'room0');
                res.body.should.have.property('name', 'roomBis');
            });
        });
        it('should not update', function() {
            return chai.request(server).put('/rooms/none/details').send({
                name: 'roomBis'
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('DELETE /rooms/:roomId', function() {
        it('should remove', function() {
            return chai.request(server).del('/rooms/room0').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('roomId', 'room0');
                res.body.should.have.property('name', 'room0');
            });
        });
        it('should not remove', function() {
            return chai.request(server).del('/rooms/none').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('POST /rooms/:roomId/link/:teamId', function() {
        it('should link', function() {
            return chai.request(server).post('/rooms/room1/links/team1').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('teamId', 'team1');
                res.body.should.have.property('name', 'team1');
            });
        });
        it('should not link', function() {
            return chai.request(server).post('/rooms/room1/links/none').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('DELETE /rooms/:roomId/link/:teamId', function() {
        it('should unlink', function() {
            return chai.request(server).del('/rooms/room0/links/team0').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('teamId', 'team0');
                res.body.should.have.property('name', 'team0');
            });
        });
        it('should not unlink', function() {
            return chai.request(server).del('/rooms/room1/links/none').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

});
/* jshint +W030 */