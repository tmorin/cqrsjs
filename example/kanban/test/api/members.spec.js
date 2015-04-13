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

describe('/members', function() {

    beforeEach(function() {
        cqrs.debug = false;
        helper.reset();
    });

    afterEach(function() {
        server.close();
    });

    describe('POST /members', function() {
        it('should add', function() {
            return chai.request(server).post('/members').send({
                teamId: 'team1',
                personId: 'person1'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('teamId', 'team1');
                res.body.should.have.property('teamName', 'team1');
                res.body.should.have.property('personId', 'person1');
                res.body.should.have.property('personName', 'person1');
            });
        });
        it('should not add when no team', function() {
            return chai.request(server).post('/members').send({
                teamId: 'none',
                personId: 'person1'
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
        it('should not add when no person', function() {
            return chai.request(server).post('/members').send({
                teamId: 'team1',
                personId: 'none'
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

    describe('DELETE /members', function() {
        it('should remove', function() {
            return chai.request(server).del('/members').send({
                teamId: 'team0',
                personId: 'person0'
            }).then(function(res) {
                res.should.have.status(200);
                res.body.should.have.property('teamId', 'team0');
                res.body.should.have.property('teamName', 'team0');
                res.body.should.have.property('personId', 'person0');
                res.body.should.have.property('personName', 'person0');
            });
        });
        it('should not remove', function() {
            return chai.request(server).del('/members').send({
                teamId: 'team1',
                personId: 'person1'
            }).then(function(res) {
                res.should.have.status(500);
            });
        });
    });

});
/* jshint +W030 */