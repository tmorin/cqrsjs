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

describe('/persons', function() {

    beforeEach(function() {
        cqrs.debug = false;
        helper.reset();
    });

    afterEach(function() {
        http.close();
    });

    describe('POST /persons', function() {
        it('should add', function() {
            return chai.request(http).post('/persons').auth('admin', 'admin').send({
                name: 'new person'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('personId');
                res.body.should.have.property('name', 'new person');
            });
        });
        it('should not add', function() {
            return chai.request(http).post('/persons').auth('admin', 'admin').send({
                name: ''
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('GET /persons/:personId', function() {
        it('should get', function() {
            return chai.request(http).get('/persons/person0').auth('admin', 'admin').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('personId');
                res.body.should.have.property('name', 'person0');
            });
        });
        it('should not get', function() {
            return chai.request(http).get('/persons/none').auth('admin', 'admin').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('GET /persons/:personId/teams', function() {
        it('should get', function() {
            return chai.request(http).get('/persons/person0/teams').auth('admin', 'admin').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.length(1);
                res.body[0].should.have.property('teamId', 'team0');
                res.body[0].should.have.property('name', 'team0');
            });
        });
        it('should not get', function() {
            return chai.request(http).get('/persons/none/teams').auth('admin', 'admin').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('PUT /persons/:personId/details', function() {
        it('should update', function() {
            return chai.request(http).put('/persons/person0/details').auth('admin', 'admin').send({
                name: 'personBis'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('personId');
                res.body.should.have.property('name', 'personBis');
            });
        });
        it('should not update', function() {
            return chai.request(http).put('/persons/none/details').auth('admin', 'admin').send({
                name: 'personBis'
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('DELETE /persons/:personId', function() {
        it('should remove', function() {
            return chai.request(http).del('/persons/person0').auth('admin', 'admin').then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('personId');
                res.body.should.have.property('name', 'person0');
            });
        });
        it('should not remove', function() {
            return chai.request(http).del('/persons/none').auth('admin', 'admin').then(function(res) {
                res.should.have.status(500);
            });
        });
    });

});
/* jshint +W030 */