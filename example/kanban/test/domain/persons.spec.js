/*globals describe:false, beforeEach:false, afterEach:false, it:false */
/*jshint -W030, browser:false */

var storage = require('../../lib/storage').local;

var cqrs = require('../../../../lib/cqrs');
require('../../lib/domain/persons.handlers');
require('../../lib/domain/persons.repo.local');
require('../../lib/domain/rights.handlers');
require('../../lib/domain/rights.repo.local');

var sinon = require('sinon');
var chai = require('chai');
var sinonChai = require('sinon-chai');
var charAsPromised = require('chai-as-promised');

chai.should();
chai.use(sinonChai);
chai.use(charAsPromised);

describe('persons', function() {
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

    describe('add person', function() {
        beforeEach(function() {
            payload = {
                name: 'person1'
            };
            c.on('person-added').invoke(listener1);
            return c.send('add-person', payload, metadata).should.not.be.rejected;
        });
        it('should publish person added', function() {
            listener1.should.have.been.calledWith(sinon.match.has('personId').and(sinon.match.has('name', 'person1')), sinon.match.object);
        });
        it('should save the person', function() {
            var persons = JSON.parse(storage.getItem('persons'));
            Object.keys(persons).should.have.length(1);
        });
    });

    describe('remove person', function() {
        beforeEach(function() {
            storage.setItem('persons', JSON.stringify({
                personId: {
                    personId: 'personId',
                    name: 'personName'
                }
            }));
            payload = {
                personId: 'personId'
            };
            c.on('person-removed').invoke(listener1);
            return c.send('remove-person', payload, metadata).should.not.be.rejected;
        });
        it('should publish person removed', function() {
            listener1.should.have.been.calledWith(sinon.match.has('personId', 'personId').and(sinon.match.has('name', 'personName')), sinon.match.object);
        });
        it('should deactive the person', function() {
            var persons = JSON.parse(storage.getItem('persons'));
            persons.personId.deactivated.should.true;
        });
    });

    describe('update person details', function() {
        beforeEach(function() {
            storage.setItem('persons', JSON.stringify({
                personId: {
                    personId: 'personId',
                    name: 'personName'
                }
            }));
            payload = {
                personId: 'personId',
                name: 'personNameBis',
            };
            c.on('person-details-updated').invoke(listener1);
            return c.send('update-person-details', payload, metadata).should.not.be.rejected;
        });
        it('should publish person details updated', function() {
            listener1.should.have.been.calledWith(sinon.match.has('personId', 'personId').and(sinon.match.has('name', 'personNameBis')), sinon.match.object);
        });
        it('should update the person', function() {
            var persons = JSON.parse(storage.getItem('persons'));
            persons.personId.name.should.eq('personNameBis');
        });
    });

    describe('get existing person', function() {
        beforeEach(function() {
            storage.setItem('persons', JSON.stringify({
                person1: {
                    personId: 'person1',
                    name: 'name1'
                }
            }));
        });
        it('should get the person', function() {
            return c.call('get-person', 'person1').should.not.be.rejected;
        });
    });

    describe('get a none existing person', function() {
        beforeEach(function() {
            storage.setItem('persons', JSON.stringify({
                person1: {
                    personId: 'person1',
                    name: 'name1',
                    deactivated: true
                }
            }));
        });
        it('should not get the person', function() {
            return c.call('get-person', 'person1').should.be.rejected;
        });
    });

});
/* jshint +W030 */