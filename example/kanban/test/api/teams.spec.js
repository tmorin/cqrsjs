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

describe('/teams', function() {

    beforeEach(function() {
        cqrs.debug = false;
        helper.reset();
    });

    afterEach(function() {
        server.close();
    });

    describe('POST /teams', function() {
        it('should add', function() {
            return chai.request(server).post('/teams').send({
                name: 'new team'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('teamId');
                res.body.should.have.property('name', 'new team');
            });
        });
        it('should not add', function() {
            return chai.request(server).post('/teams').send({
                name: ''
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('GET /teams/:teamId', function() {
        it('should get', function() {
            return chai.request(server).get('/teams/team0').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('teamId', 'team0');
                res.body.should.have.property('name', 'team0');
            });
        });
        it('should not get', function() {
            return chai.request(server).get('/teams/none').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('GET /teams/:teamId/persons', function() {
        it('should get', function() {
            return chai.request(server).get('/teams/team0/persons').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.length(1);
                res.body[0].should.have.property('personId', 'person0');
                res.body[0].should.have.property('name', 'person0');
            });
        });
        it('should not get', function() {
            return chai.request(server).get('/teams/none/persons').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('PUT /teams/:teamId/details', function() {
        it('should update', function() {
            return chai.request(server).put('/teams/team0/details').send({
                name: 'teamBis'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('teamId', 'team0');
                res.body.should.have.property('name', 'teamBis');
            });
        });
        it('should not update', function() {
            return chai.request(server).put('/teams/none/details').send({
                name: 'teamBis'
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('DELETE /teams/:teamId', function() {
        it('should remove', function() {
            return chai.request(server).del('/teams/team0').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('teamId', 'team0');
                res.body.should.have.property('name', 'team0');
            });
        });
        it('should not remove', function() {
            return chai.request(server).del('/teams/none').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

});
/* jshint +W030 */