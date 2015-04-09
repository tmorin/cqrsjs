/*globals describe:false, beforeEach:false, afterEach:false, it:false */
/*jshint -W030, browser:false */

var storage = require('../../lib/storage').local;

var cqrs = require('../../../../lib/cqrs');
require('../../lib/domain/teams.handlers');
require('../../lib/domain/teams.repo.local');
require('../../lib/domain/rights.handlers');
require('../../lib/domain/rights.repo.local');

var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var charAsPromised = require('chai-as-promised');

chai.should();
chai.use(sinonChai);
chai.use(charAsPromised);

describe('teams', function() {
    var c, payload, metadata, listener1;

    beforeEach(function() {
        cqrs.debug = false;
        storage.clear();
        storage.setItem('rights', JSON.stringify({
            person1: {
                personId: 'person1',
                roles: ['admin']
            }
        }));
        metadata = {
            userId: 'person1'
        };
        c = cqrs();
        listener1 = sinon.spy();
    });

    afterEach(function() {
        c.destroy();
    });

    describe('add team', function() {
        beforeEach(function() {
            payload = {
                name: 'team1'
            };
            c.on('team-added').invoke(listener1);
            return c.send('add-team', payload, metadata).should.not.be.rejected;
        });
        it('should publish team added', function() {
            listener1.should.have.been.calledWith(sinon.match.has('teamId').and(sinon.match.has('name', 'team1')), sinon.match.object);
        });
        it('should save the team', function() {
            var teams = JSON.parse(storage.getItem('teams'));
            Object.keys(teams).should.have.length(1);
        });
    });

    describe('remove team', function() {
        beforeEach(function() {
            storage.setItem('teams', JSON.stringify({
                teamId: {
                    teamId: 'teamId',
                    name: 'teamName'
                }
            }));
            payload = {
                teamId: 'teamId'
            };
            c.on('team-removed').invoke(listener1);
            return c.send('remove-team', payload, metadata).should.not.be.rejected;
        });
        it('should publish team removed', function() {
            listener1.should.have.been.calledWith(sinon.match.has('teamId', 'teamId').and(sinon.match.has('name', 'teamName')), sinon.match.object);
        });
        it('should delete the team', function() {
            var teams = JSON.parse(storage.getItem('teams'));
            Object.keys(teams).should.have.length(0);
        });
    });

    describe('update team details', function() {
        beforeEach(function() {
            storage.setItem('teams', JSON.stringify({
                teamId: {
                    teamId: 'teamId',
                    name: 'name',
                    description: 'description'
                }
            }));
            payload = {
                teamId: 'teamId',
                name: 'nameBis',
                description: 'descriptionBis'
            };
            c.on('team-details-updated').invoke(listener1);
            return c.send('update-team-details', payload, metadata).should.not.be.rejected;
        });
        it('should publish team details updated', function() {
            listener1.should.have.been.calledWith(sinon.match.has('teamId', 'teamId').and(sinon.match.has('name', 'nameBis')).and(sinon.match.has('description', 'descriptionBis')), sinon.match.object);
        });
        it('should update the team', function() {
            var teams = JSON.parse(storage.getItem('teams'));
            teams.teamId.name.should.eq('nameBis');
            teams.teamId.description.should.eq('descriptionBis');
        });
    });

    describe('get existing team', function() {
        beforeEach(function() {
            storage.setItem('teams', JSON.stringify({
                team1: {
                    teamId: 'team1',
                    name: 'name1'
                }
            }));
        });
        it('should get the team', function() {
            return c.call('get-team', 'team1').should.not.be.rejected;
        });
    });

    describe('get a none existing team', function() {
        it('should not get the team', function() {
            return c.call('get-team', 'team1').should.be.rejected;
        });
    });

});
/* jshint +W030 */