/*globals describe:false, beforeEach:false, afterEach:false, it:false */
/*jshint -W030, browser:false */

var storage = require('../../lib/storage').local;

var cqrs = require('../../../../lib/cqrs');
require('../../lib/domain/rooms.handlers');
require('../../lib/domain/rooms.repo.local');
require('../../lib/domain/rights.handlers');
require('../../lib/domain/rights.repo.local');

var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var charAsPromised = require('chai-as-promised');

chai.should();
chai.use(sinonChai);
chai.use(charAsPromised);

describe('rooms', function() {
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

    describe('add room', function() {
        beforeEach(function() {
            payload = {
                name: 'room1'
            };
            c.on('room-added').invoke(listener1);
            return c.send('add-room', payload, metadata).should.not.be.rejected;
        });
        it('should publish room added', function() {
            listener1.should.have.been.calledWith(sinon.match.has('roomId')
                .and(sinon.match.has('name', 'room1')), sinon.match.object);
        });
        it('should save the room', function() {
            var rooms = JSON.parse(storage.getItem('rooms'));
            Object.keys(rooms).should.have.length(1);
        });
    });

    describe('remove room', function() {
        beforeEach(function() {
            storage.setItem('rooms', JSON.stringify({
                roomId: {
                    roomId: 'roomId',
                    name: 'roomName'
                }
            }));
            payload = {
                roomId: 'roomId'
            };
            c.on('room-removed').invoke(listener1);
            return c.send('remove-room', payload, metadata).should.not.be.rejected;
        });
        it('should publish room removed', function() {
            listener1.should.have.been.calledWith(sinon.match.has('roomId', 'roomId')
                .and(sinon.match.has('name', 'roomName')), sinon.match.object);
        });
        it('should delete the room', function() {
            var rooms = JSON.parse(storage.getItem('rooms'));
            Object.keys(rooms).should.have.length(0);
        });
    });

    describe('update room details', function() {
        beforeEach(function() {
            storage.setItem('rooms', JSON.stringify({
                room1: {
                    roomId: 'room1',
                    name: 'name',
                    description: 'description'
                }
            }));
            payload = {
                roomId: 'room1',
                name: 'nameBis',
                description: 'descriptionBis'
            };
            c.on('room-details-updated').invoke(listener1);
            return c.send('update-room-details', payload, metadata).should.not.be.rejected;
        });
        it('should publish room details updated', function() {
            listener1.should.have.been.calledWith(sinon.match.has('roomId', 'room1')
                .and(sinon.match.has('name', 'nameBis'))
                .and(sinon.match.has('description', 'descriptionBis')), sinon.match.object);
        });
        it('should update the room', function() {
            var rooms = JSON.parse(storage.getItem('rooms'));
            rooms.room1.name.should.eq('nameBis');
            rooms.room1.description.should.eq('descriptionBis');
        });
    });

    describe('link a room to a team', function() {
        beforeEach(function() {
            storage.setItem('rooms', JSON.stringify({
                room1: {
                    roomId: 'room1',
                    name: 'room1',
                    teams: [],
                    description: 'description'
                }
            }));
            storage.setItem('teams', JSON.stringify({
                team1: {
                    teamId: 'team1',
                    name: 'team1'
                }
            }));
            payload = {
                roomId: 'room1',
                teamId: 'team1'
            };
            c.on('room-linked-to-team').invoke(listener1);
            return c.send('link-room-to-team', payload, metadata).should.not.be.rejected;
        });
        it('should publish room linked to team', function() {
            listener1.should.have.been.calledWith(sinon.match.has('roomId', 'room1')
                .and(sinon.match.has('roomName', 'room1'))
                .and(sinon.match.has('teamId', 'team1'))
                .and(sinon.match.has('teamName', 'team1')), sinon.match.object);
        });
        it('should update the room', function() {
            var rooms = JSON.parse(storage.getItem('rooms'));
            rooms.room1.teams.should.include('team1');
        });
    });

    describe('link a room to an already linked team', function() {
        beforeEach(function() {
            storage.setItem('rooms', JSON.stringify({
                room1: {
                    roomId: 'room1',
                    name: 'room1',
                    teams: ['team1'],
                    description: 'description'
                }
            }));
            storage.setItem('teams', JSON.stringify({
                team1: {
                    teamId: 'team1',
                    name: 'team1'
                }
            }));
            payload = {
                roomId: 'room1',
                teamId: 'team1'
            };
            c.on('room-linked-to-team').invoke(listener1);
            return c.send('link-room-to-team', payload, metadata).should.be.rejected;
        });
        it('should not publish room linked to team', function() {
            listener1.should.have.not.been.called;
        });
        it('should not update the room', function() {
            var rooms = JSON.parse(storage.getItem('rooms'));
            rooms.room1.teams.should.include('team1');
        });
    });

    describe('unlink a room to a team', function() {
        beforeEach(function() {
            storage.setItem('rooms', JSON.stringify({
                room1: {
                    roomId: 'room1',
                    name: 'room1',
                    teams: ['team1'],
                    description: 'description'
                }
            }));
            storage.setItem('teams', JSON.stringify({
                team1: {
                    teamId: 'team1',
                    name: 'team1'
                }
            }));
            payload = {
                roomId: 'room1',
                teamId: 'team1'
            };
            c.on('room-unlinked-to-team').invoke(listener1);
            return c.send('unlink-room-to-team', payload, metadata).should.not.be.rejected;
        });
        it('should publish room unlinked to team', function() {
            listener1.should.have.been.calledWith(sinon.match.has('roomId', 'room1')
                .and(sinon.match.has('roomName', 'room1'))
                .and(sinon.match.has('teamId', 'team1'))
                .and(sinon.match.has('teamName', 'team1')), sinon.match.object);
        });
        it('should update the room', function() {
            var rooms = JSON.parse(storage.getItem('rooms'));
            rooms.room1.teams.should.not.include('team1');
        });
    });

    describe('unlink a room to an none linked team', function() {
        beforeEach(function() {
            storage.setItem('rooms', JSON.stringify({
                room1: {
                    roomId: 'room1',
                    name: 'room1',
                    teams: [],
                    description: 'description'
                }
            }));
            storage.setItem('teams', JSON.stringify({
                team1: {
                    teamId: 'team1',
                    name: 'team1'
                }
            }));
            payload = {
                roomId: 'room1',
                teamId: 'team1'
            };
            c.on('room-unlinked-to-team').invoke(listener1);
            return c.send('unlink-room-to-team', payload, metadata).should.be.rejected;
        });
        it('should not publish room unlinked to team', function() {
            listener1.should.have.not.been.called;
        });
        it('should not update the room', function() {
            var rooms = JSON.parse(storage.getItem('rooms'));
            rooms.room1.teams.should.not.include('team1');
        });
    });

    describe('get existing room', function() {
        beforeEach(function() {
            storage.setItem('rooms', JSON.stringify({
                room1: {
                    roomId: 'room1',
                    name: 'name1'
                }
            }));
        });
        it('should get the room', function() {
            return c.call('get-room', 'room1').should.not.be.rejected;
        });
    });

    describe('get a none existing room', function() {
        it('should not get the room', function() {
            return c.call('get-room', 'room1').should.be.rejected;
        });
    });

});
/* jshint +W030 */