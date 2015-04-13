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

describe('/persons', function() {

    beforeEach(function() {
        cqrs.debug = false;
        helper.reset();
    });

    afterEach(function() {
        server.close();
    });

    describe('POST /persons', function() {
        it('should add', function() {
            return chai.request(server).post('/persons').send({
                name: 'new person'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('personId');
                res.body.should.have.property('name', 'new person');
            });
        });
        it('should not add', function() {
            return chai.request(server).post('/persons').send({
                name: ''
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('GET /persons/:personId', function() {
        it('should get', function() {
            return chai.request(server).get('/persons/person0').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('personId');
                res.body.should.have.property('name', 'person0');
            });
        });
        it('should not get', function() {
            return chai.request(server).get('/persons/none').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('GET /persons/:personId/teams', function() {
        it('should get', function() {
            return chai.request(server).get('/persons/person0/teams').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.length(1);
                res.body[0].should.have.property('teamId', 'team0');
                res.body[0].should.have.property('name', 'team0');
            });
        });
        it('should not get', function() {
            return chai.request(server).get('/persons/none/teams').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('PUT /persons/:personId/details', function() {
        it('should update', function() {
            return chai.request(server).put('/persons/person0/details').send({
                name: 'personBis'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('personId');
                res.body.should.have.property('name', 'personBis');
            });
        });
        it('should not update', function() {
            return chai.request(server).put('/persons/none/details').send({
                name: 'personBis'
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('DELETE /persons/:personId', function() {
        it('should remove', function() {
            return chai.request(server).del('/persons/person0').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('personId');
                res.body.should.have.property('name', 'person0');
            });
        });
        it('should not remove', function() {
            return chai.request(server).del('/persons/none').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

});
/* jshint +W030 */