var server = require('../server');
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

server.post('/rooms/:roomId/boards', function(req, res, next) {
    c.send('add-board', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.get('/rooms/:roomId/boards', function(req, res, next) {
    c.call('get-room', req.params.roomId).then(function () {
        return c.call('list-boards-from-room', req.params.roomId);
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.get('/rooms/:roomId/boards/:boardId', function(req, res, next) {
    c.call('get-board', req.params.roomId, req.params.boardId).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.put('/rooms/:roomId/boards/:boardId/details', function(req, res, next) {
    c.send('update-board-details', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.del('/rooms/:roomId/boards/:boardId', function(req, res, next) {
    c.send('remove-board', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});
