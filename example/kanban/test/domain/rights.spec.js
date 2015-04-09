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

describe('rights', function() {
    var c, payload, metadata, listener1;

    beforeEach(function() {
        cqrs.debug = false;
        storage.clear();
        storage.setItem('rights', JSON.stringify({
            person1: {
                roles: ['admin']
            },
            person2: {
                roles: ['admin']
            },
            person3: {}
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

    describe('update roles', function() {
        beforeEach(function() {
            payload = {
                personId: 'person1',
                roles: ['admin', 'role']
            };
            c.on('roles-updated').invoke(listener1);
            return c.send('update-roles', payload, metadata).should.not.be.rejected;
        });
        it('should publish roles updated', function() {
            listener1.should.have.been.calledWith(sinon.match.has('personId', 'person1')
                .and(sinon.match.has('roles', ['admin', 'role'])), sinon.match.object);
        });
        it('should save the roles', function() {
            var rights = JSON.parse(storage.getItem('rights'));
            rights.person1.roles.should.include('role');
        });
    });

    describe('when person removed', function() {
        beforeEach(function() {
            payload = {
                personId: 'person2',
                name: 'person2'
            };
            return c.publish('person-removed', payload, metadata).should.not.be.rejected;
        });
        it('should save the roles', function() {
            var rights = JSON.parse(storage.getItem('rights'));
            rights.should.not.have.property('person2');
        });
    });

    describe('has role when person exist', function() {
        it('should be true', function() {
            return c.call('has-role', 'person1', 'admin').should.become(true);
        });
    });

    describe('has role when role not include', function() {
        it('should be false', function() {
            return c.call('has-role', 'person1', 'role').should.become(false);
        });
    });

    describe('has role when roles not exist', function() {
        it('should be false', function() {
            return c.call('has-role', 'person3', 'role').should.become(false);
        });
    });

    describe('has role when person not exist', function() {
        it('should be false', function() {
            return c.call('has-role', 'person4', 'admin').should.become(false);
        });
    });

    describe('check right when not admin', function() {
        it('should be rejected', function() {
            return c.call('check-right', 'manage-persons', 'person3').should.be.rejected;
        });
    });

    describe('check right when personId equals to userId', function() {
        it('should not be rejected', function() {
            return c.call('check-right', 'manage-person', 'person3', 'person3').should.not.be.rejected;
        });
    });

    describe('check right when personId not equals to userId', function() {
        it('should be rejected', function() {
            return c.call('check-right', 'manage-person', 'person3', 'person1').should.be.rejected;
        });
    });

    describe('check right when person is member of a team linked to a room ', function() {
        beforeEach(function() {
            storage.setItem('teams', JSON.stringify({
                team1: {
                    teamId: 'team1'
                }
            }));
            storage.setItem('rooms', JSON.stringify({
                room1: {
                    roomId: 'room1',
                    teams: ['team1']
                }
            }));
            storage.setItem('members', JSON.stringify([{
                teamId: 'team1',
                personId: 'person3'
            }]));
        });
        it('should not be rejected', function() {
            return c.call('check-right', 'manage-room', 'person3', 'room1').should.not.be.rejected;
        });
    });

    describe('check right when person is not member of a team linked to a room ', function() {
        beforeEach(function() {
            storage.setItem('teams', JSON.stringify({
                team1: {
                    teamId: 'team1'
                }
            }));
            storage.setItem('rooms', JSON.stringify({
                room1: {
                    roomId: 'room1',
                    teams: ['team1']
                }
            }));
            storage.setItem('members', JSON.stringify([{
                teamId: 'team1',
                personId: 'person1'
            }]));
        });
        it('should be rejected', function() {
            return c.call('check-right', 'manage-room', 'person3', 'room1').should.be.rejected;
        });
    });

});
/* jshint +W030 */