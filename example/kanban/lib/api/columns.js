var passport = require('passport');
var http = require('../server').http;
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

http.post('/rooms/:roomId/boards/:boardId/columns', passport.authenticate('basic'), function(req, res, next) {
    c.send('add-column', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.get('/rooms/:roomId/boards/:boardId/columns', passport.authenticate('basic'), function(req, res, next) {
    c.call('get-board', req.params.roomId, req.params.boardId).then(function() {
        return c.call('list-columns-from-board', req.params.roomId, req.params.boardId);
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.get('/rooms/:roomId/boards/:boardId/columns/:columnId', passport.authenticate('basic'), function(req, res, next) {
    c.call('get-column', req.params.roomId, req.params.boardId, req.params.columnId).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.put('/rooms/:roomId/boards/:boardId/columns/:columnId/details', passport.authenticate('basic'), function(req, res, next) {
    c.send('update-column-details', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.put('/rooms/:roomId/boards/:boardId/columns/order', passport.authenticate('basic'), function(req, res, next) {
    c.send('update-columns-order', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload.columns);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.del('/rooms/:roomId/boards/:boardId/columns/:columnId', passport.authenticate('basic'), function(req, res, next) {
    c.send('remove-column', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});
