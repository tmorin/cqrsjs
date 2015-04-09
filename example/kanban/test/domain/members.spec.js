/*globals describe:false, beforeEach:false, afterEach:false, it:false */
/*jshint -W030, browser:false */

var storage = require('../../lib/storage').local;

var cqrs = require('../../../../lib/cqrs');
require('../../lib/domain/members.handlers');
require('../../lib/domain/members.repo.local');
require('../../lib/domain/rights.handlers');
require('../../lib/domain/rights.repo.local');

var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var charAsPromised = require('chai-as-promised');

chai.should();
chai.use(sinonChai);
chai.use(charAsPromised);

describe('members', function() {
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

    describe('add member', function() {
        beforeEach(function() {
            storage.setItem('teams', JSON.stringify({
                team1: {
                    teamId: 'team1',
                    name: 'team1'
                }
            }));
            storage.setItem('persons', JSON.stringify({
                person1: {
                    personId: 'person1',
                    name: 'person1'
                }
            }));
            payload = {
                personId: 'person1',
                teamId: 'team1'
            };
            c.on('member-added').invoke(listener1);
            return c.send('add-member', payload, metadata).should.not.be.rejected;
        });
        it('should publish member added', function() {
            listener1.should.have.been.calledWith(sinon.match.has('personId', 'person1')
                .and(sinon.match.has('personName', 'person1'))
                .and(sinon.match.has('teamId', 'team1'))
                .and(sinon.match.has('teamName', 'team1')), sinon.match.object);
        });
        it('should save the members', function() {
            var members = JSON.parse(storage.getItem('members'));
            Object.keys(members).should.have.length(1);
        });
    });

    describe('add member when already exist', function() {
        beforeEach(function() {
            storage.setItem('teams', JSON.stringify({
                team1: {
                    teamId: 'team1',
                    name: 'team1'
                }
            }));
            storage.setItem('persons', JSON.stringify({
                person1: {
                    personId: 'person1',
                    name: 'person1'
                }
            }));
            storage.setItem('members', JSON.stringify([{
                personId: 'person1',
                personName: 'person1',
                teamId: 'team1',
                teamName: 'team1'
            }]));
            payload = {
                personId: 'person1',
                teamId: 'team1'
            };
            c.on('member-added').invoke(listener1);
            return c.send('add-member', payload, metadata).should.be.rejected;
        });
        it('should not publish member added', function() {
            listener1.should.have.not.been.called;
        });
        it('should not save the members', function() {
            var members = JSON.parse(storage.getItem('members'));
            Object.keys(members).should.have.length(1);
        });
    });

    describe('remove member', function() {
        beforeEach(function() {
            storage.setItem('teams', JSON.stringify({
                team1: {
                    teamId: 'team1',
                    name: 'team1'
                }
            }));
            storage.setItem('persons', JSON.stringify({
                person1: {
                    personId: 'person1',
                    name: 'person1'
                }
            }));
            storage.setItem('members', JSON.stringify([{
                personId: 'person1',
                personName: 'person1',
                teamId: 'team1',
                teamName: 'team1'
            }]));
            payload = {
                personId: 'person1',
                teamId: 'team1'
            };
            c.on('member-removed').invoke(listener1);
            return c.send('remove-member', payload, metadata).should.not.be.rejected;
        });
        it('should publish member removed', function() {
            listener1.should.have.been.calledWith(sinon.match.has('personId', 'person1')
                .and(sinon.match.has('personName', 'person1'))
                .and(sinon.match.has('teamId', 'team1'))
                .and(sinon.match.has('teamName', 'team1')), sinon.match.object);
        });
        it('should save the members', function() {
            var members = JSON.parse(storage.getItem('members'));
            Object.keys(members).should.have.length(0);
        });
    });

    describe('remove member when not exist', function() {
        beforeEach(function() {
            storage.setItem('teams', JSON.stringify({
                team1: {
                    teamId: 'team1',
                    name: 'team1'
                }
            }));
            storage.setItem('persons', JSON.stringify({
                person1: {
                    personId: 'person1',
                    name: 'person1'
                }
            }));
            storage.setItem('members', JSON.stringify([{
                personId: 'person2',
                personName: 'person2',
                teamId: 'team2',
                teamName: 'team2'
            }]));
            payload = {
                personId: 'person1',
                teamId: 'team1'
            };
            c.on('member-removed').invoke(listener1);
            return c.send('remove-member', payload, metadata).should.be.rejected;
        });
        it('should not publish member removed', function() {
            listener1.should.have.not.been.called;
        });
        it('should not save the members', function() {
            var members = JSON.parse(storage.getItem('members'));
            Object.keys(members).should.have.length(1);
        });
    });

    describe('when team removed', function() {
        beforeEach(function() {
            storage.setItem('teams', JSON.stringify({
                team1: {
                    teamId: 'team1',
                    name: 'team1'
                }
            }));
            storage.setItem('persons', JSON.stringify({
                person1: {
                    personId: 'person1',
                    name: 'person1'
                }
            }));
            storage.setItem('members', JSON.stringify([{
                personId: 'person1',
                personName: 'person1',
                teamId: 'team1',
                teamName: 'team1'
            }]));
            payload = {
                teamId: 'team1',
                name: 'team1'
            };
            c.on('member-removed').invoke(listener1);
            return c.publish('team-removed', payload, metadata).should.not.be.rejected;
        });
        it('should publish member removed', function() {
            listener1.should.have.been.calledWith(sinon.match.has('personId', 'person1')
                .and(sinon.match.has('personName', 'person1'))
                .and(sinon.match.has('teamId', 'team1'))
                .and(sinon.match.has('teamName', 'team1')), sinon.match.object);
        });
        it('should save the members', function() {
            var members = JSON.parse(storage.getItem('members'));
            Object.keys(members).should.have.length(0);
        });
    });

    describe('when team updated', function() {
        beforeEach(function() {
            storage.setItem('teams', JSON.stringify({
                team1: {
                    teamId: 'team1',
                    name: 'team1'
                }
            }));
            storage.setItem('persons', JSON.stringify({
                person1: {
                    personId: 'person1',
                    name: 'person1'
                }
            }));
            storage.setItem('members', JSON.stringify([{
                personId: 'person1',
                personName: 'person1',
                teamId: 'team1',
                teamName: 'team1'
            }]));
            payload = {
                teamId: 'team1',
                name: 'team1Bis'
            };
            c.on('member-updated').invoke(listener1);
            return c.publish('team-updated', payload, metadata).should.not.be.rejected;
        });
        it('should publish member updated', function() {
            listener1.should.have.been.calledWith(sinon.match.has('personId', 'person1')
                .and(sinon.match.has('personName', 'person1'))
                .and(sinon.match.has('teamId', 'team1'))
                .and(sinon.match.has('teamName', 'team1Bis')), sinon.match.object);
        });
        it('should save the members', function() {
            var members = JSON.parse(storage.getItem('members'));
            Object.keys(members).should.have.length(1);
            Object.keys(members)[0].teamName = 'team1Bis';
        });
    });

    describe('when person removed', function() {
        beforeEach(function() {
            storage.setItem('teams', JSON.stringify({
                team1: {
                    teamId: 'team1',
                    name: 'team1'
                }
            }));
            storage.setItem('persons', JSON.stringify({
                person1: {
                    personId: 'person1',
                    name: 'person1'
                }
            }));
            storage.setItem('members', JSON.stringify([{
                personId: 'person1',
                personName: 'person1',
                teamId: 'team1',
                teamName: 'team1'
            }]));
            payload = {
                personId: 'person1',
                name: 'person1'
            };
            c.on('member-removed').invoke(listener1);
            return c.publish('person-removed', payload, metadata).should.not.be.rejected;
        });
        it('should publish member removed', function() {
            listener1.should.have.been.calledWith(sinon.match.has('personId', 'person1')
                .and(sinon.match.has('personName', 'person1'))
                .and(sinon.match.has('personId', 'person1'))
                .and(sinon.match.has('personName', 'person1')), sinon.match.object);
        });
        it('should save the members', function() {
            var members = JSON.parse(storage.getItem('members'));
            Object.keys(members).should.have.length(0);
        });
    });

    describe('when team updated', function() {
        beforeEach(function() {
            storage.setItem('teams', JSON.stringify({
                team1: {
                    teamId: 'team1',
                    name: 'team1'
                }
            }));
            storage.setItem('persons', JSON.stringify({
                person1: {
                    personId: 'person1',
                    name: 'person1'
                }
            }));
            storage.setItem('members', JSON.stringify([{
                personId: 'person1',
                personName: 'person1',
                teamId: 'team1',
                teamName: 'team1'
            }]));
            payload = {
                personId: 'person1',
                name: 'person1Bis'
            };
            c.on('member-updated').invoke(listener1);
            return c.publish('person-updated', payload, metadata).should.not.be.rejected;
        });
        it('should publish member updated', function() {
            listener1.should.have.been.calledWith(sinon.match.has('personId', 'person1')
                .and(sinon.match.has('personName', 'person1Bis'))
                .and(sinon.match.has('teamId', 'team1'))
                .and(sinon.match.has('teamName', 'team1')), sinon.match.object);
        });
        it('should save the members', function() {
            var members = JSON.parse(storage.getItem('members'));
            Object.keys(members).should.have.length(1);
            Object.keys(members)[0].personName = 'person1Bis';
        });
    });

});
/* jshint +W030 */