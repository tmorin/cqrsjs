var server = require('../server');
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

server.post('/rooms/:roomId/boards/:boardId/columns', function(req, res, next) {
    c.send('add-column', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.get('/rooms/:roomId/boards/:boardId/columns', function(req, res, next) {
    c.call('get-board', req.params.roomId, req.params.boardId).then(function() {
        return c.call('list-columns-from-board', req.params.roomId, req.params.boardId);
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.get('/rooms/:roomId/boards/:boardId/columns/:columnId', function(req, res, next) {
    c.call('get-column', req.params.roomId, req.params.boardId, req.params.columnId).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.put('/rooms/:roomId/boards/:boardId/columns/:columnId/details', function(req, res, next) {
    c.send('update-column-details', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.put('/rooms/:roomId/boards/:boardId/columns/order', function(req, res, next) {
    c.send('update-columns-order', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload.columns);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.del('/rooms/:roomId/boards/:boardId/columns/:columnId', function(req, res, next) {
    c.send('remove-column', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});
