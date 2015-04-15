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

describe('/teams', function() {

    beforeEach(function() {
        cqrs.debug = false;
        helper.reset();
    });

    afterEach(function() {
        http.close();
    });

    describe('POST /teams', function() {
        it('should add', function() {
            return chai.request(http).post('/teams').auth('admin', 'admin').send({
                name: 'new team'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('teamId');
                res.body.should.have.property('name', 'new team');
            });
        });
        it('should not add', function() {
            return chai.request(http).post('/teams').auth('admin', 'admin').send({
                name: ''
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('GET /teams/:teamId', function() {
        it('should get', function() {
            return chai.request(http).get('/teams/team0').auth('admin', 'admin').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('teamId', 'team0');
                res.body.should.have.property('name', 'team0');
            });
        });
        it('should not get', function() {
            return chai.request(http).get('/teams/none').auth('admin', 'admin').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('GET /teams/:teamId/persons', function() {
        it('should get', function() {
            return chai.request(http).get('/teams/team0/persons').auth('admin', 'admin').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.length(1);
                res.body[0].should.have.property('personId', 'person0');
                res.body[0].should.have.property('name', 'person0');
            });
        });
        it('should not get', function() {
            return chai.request(http).get('/teams/none/persons').auth('admin', 'admin').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('PUT /teams/:teamId/details', function() {
        it('should update', function() {
            return chai.request(http).put('/teams/team0/details').auth('admin', 'admin').send({
                name: 'teamBis'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('teamId', 'team0');
                res.body.should.have.property('name', 'teamBis');
            });
        });
        it('should not update', function() {
            return chai.request(http).put('/teams/none/details').auth('admin', 'admin').send({
                name: 'teamBis'
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('DELETE /teams/:teamId', function() {
        it('should remove', function() {
            return chai.request(http).del('/teams/team0').auth('admin', 'admin').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('teamId', 'team0');
                res.body.should.have.property('name', 'team0');
            });
        });
        it('should not remove', function() {
            return chai.request(http).del('/teams/none').auth('admin', 'admin').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

});
/* jshint +W030 */