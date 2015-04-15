var passport = require('passport');
var http = require('../server').http;
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

http.post('/rooms/:roomId/boards/:boardId/columns/:columnId/cards', passport.authenticate('basic'), function(req, res, next) {
    c.send('add-card', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.get('/rooms/:roomId/boards/:boardId/columns/:columnId/cards', passport.authenticate('basic'), function(req, res, next) {
    c.call('get-column', req.params.roomId, req.params.boardId, req.params.columnId).then(function() {
        return c.call('list-cards-from-column', req.params.roomId, req.params.boardId, req.params.columnId);
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.put('/rooms/:roomId/boards/:boardId/columns/:columnId/cards/order', passport.authenticate('basic'), function(req, res, next) {
    c.send('update-cards-order', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload.cards);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.get('/rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId', passport.authenticate('basic'), function(req, res, next) {
    c.call('get-card', req.params.roomId, req.params.boardId, req.params.columnId, req.params.cardId).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.put('/rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId/details', passport.authenticate('basic'), function(req, res, next) {
    c.send('update-card-details', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.del('/rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId', passport.authenticate('basic'), function(req, res, next) {
    c.send('remove-card', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.put('/rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId/assign', passport.authenticate('basic'), function(req, res, next) {
    c.send('assign-card', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.del('/rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId/assign', passport.authenticate('basic'), function(req, res, next) {
    c.send('unassign-card', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.put('/rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId/move', passport.authenticate('basic'), function(req, res, next) {
    c.send('move-card', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});