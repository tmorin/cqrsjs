var server = require('../server');
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

server.post('/rooms/:roomId/boards/:boardId/columns/:columnId/cards', function(req, res, next) {
    c.send('add-card', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.get('/rooms/:roomId/boards/:boardId/columns/:columnId/cards', function(req, res, next) {
    c.call('get-column', req.params.roomId, req.params.boardId, req.params.columnId).then(function() {
        return c.call('list-cards-from-column', req.params.roomId, req.params.boardId, req.params.columnId);
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.get('/rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId', function(req, res, next) {
    c.call('get-card', req.params.roomId, req.params.boardId, req.params.columnId, req.params.cardId).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.put('/rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId/details', function(req, res, next) {
    c.send('update-card-details', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.del('/rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId', function(req, res, next) {
    c.send('remove-card', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.put('/rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId/assign', function(req, res, next) {
    c.send('assign-card', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.del('/rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId/assign', function(req, res, next) {
    c.send('unassign-card', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});
