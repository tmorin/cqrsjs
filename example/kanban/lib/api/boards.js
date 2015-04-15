var passport = require('passport');
var http = require('../server').http;
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

http.post('/rooms/:roomId/boards', passport.authenticate('basic'), function(req, res, next) {
    c.send('add-board', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.get('/rooms/:roomId/boards', passport.authenticate('basic'), function(req, res, next) {
    c.call('get-room', req.params.roomId).then(function () {
        return c.call('list-boards-from-room', req.params.roomId);
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.get('/rooms/:roomId/boards/:boardId', passport.authenticate('basic'), function(req, res, next) {
    c.call('get-board', req.params.roomId, req.params.boardId).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.put('/rooms/:roomId/boards/:boardId/details', passport.authenticate('basic'), function(req, res, next) {
    c.send('update-board-details', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.del('/rooms/:roomId/boards/:boardId', passport.authenticate('basic'), function(req, res, next) {
    c.send('remove-board', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});
