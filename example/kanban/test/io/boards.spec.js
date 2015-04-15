/*globals describe:false, beforeEach:false, afterEach:false, it:false */
/*jshint -W030, browser:false */

var helper = require('../helper');
var cqrs = require('../../../../lib/cqrs');
var http = require('../../lib/server').http;
require('../../lib/api/main');
require('../../lib/io/main');
require('../../lib/domain/main');

var chai = require('chai');
var sinonChai = require('sinon-chai');
var charAsPromised = require('chai-as-promised');
var chaiHttp = require('chai-http');

chai.should();
chai.use(sinonChai);
chai.use(charAsPromised);
chai.use(chaiHttp);

var socketURL = 'http://localhost:8080/boards';
var options = {
    transports: ['websocket'],
    'force new connection': true,
    'reconnection delay': 0,
    'reopen delay': 0,
    'reconnection': false
};
var createSocket = function() {
    return new Promise(function(resolve) {
        var socket = require('socket.io-client').connect(socketURL, options);
        socket.on('connect', function() {
            resolve(socket);
        });
    });
};
var subscribe = function(socket) {
    return new Promise(function(resolve) {
        socket.emit('subscribe', 'board0', function() {
            resolve(socket);
        });
    });
};
var unsubscribe = function(socket) {
    return new Promise(function(resolve) {
        socket.emit('unsubscribe', 'board0', function() {
            resolve(socket);
        });
    });
};
var waitEvent = function(event) {
    return function(socket) {
        return new Promise(function(resolve, reject) {
            var timeoutId = setTimeout(function() {
                reject(socket);
            }, 20);
            socket.on(event, function() {
                clearTimeout(timeoutId);
                resolve(socket);
            });
            chai.request(http).put('/rooms/room0/boards/board0/details').auth('admin', 'admin').send({
                name: 'boardBis'
            }).then(function(res) {
                res.should.have.status(200);
            }, function() {
                clearTimeout(timeoutId);
                reject(socket);
            });
        });
    };
};
var closeSocket = function(rejected) {
    return function(socket) {
        return new Promise(function(resolve, reject) {
            if (rejected) {
                reject(socket.close());
            } else {
                resolve(socket.close());
            }
        });
    };
};

describe('channel boards', function() {
    beforeEach(function() {
        require('winston').level = 'debug';
        cqrs.debug = false;
        helper.reset();
        http.listen(8080);
    });

    afterEach(function() {
        http.close();
    });

    describe('subscribe then wait event', function() {
        it('should be resolved', function() {
            return createSocket().then(subscribe).then(waitEvent('board-details-updated')).then(closeSocket()).should.not.be.rejected;
        });
    });

    describe('subscribe then wait event then unsubscribe', function() {
        it('should be resolved', function() {
            return createSocket().then(subscribe).then(waitEvent('board-details-updated')).then(unsubscribe).then(closeSocket()).should.not.be.rejected;
        });
    });

    describe('subscribe then wait event then unsubscribe then wait event', function() {
        it('should be rejected', function() {
            return createSocket().then(subscribe).then(waitEvent('board-details-updated')).then(unsubscribe).then(waitEvent('board-details-updated')).then(closeSocket(), closeSocket(true)).should.be.rejected;
        });
    });

});
/* jshint +W030 */