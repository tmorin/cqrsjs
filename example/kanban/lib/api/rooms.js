var passport = require('passport');
var http = require('../server').http;
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

http.post('/rooms', passport.authenticate('basic'), function(req, res, next) {
    c.send('add-room', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.get('/rooms/:roomId', passport.authenticate('basic'), function(req, res, next) {
    c.call('get-room', req.params.roomId).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.post('/rooms/:roomId/links/:teamId', passport.authenticate('basic'), function(req, res, next) {
    c.send('link-room-to-team', req.params, {
        userId: req.user.personId
    }).then(function (link) {
        return {
            teamId: link.teamId,
            name: link.teamName
        };
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.del('/rooms/:roomId/links/:teamId', passport.authenticate('basic'), function(req, res, next) {
    c.send('unlink-room-to-team', req.params, {
        userId: req.user.personId
    }).then(function (link) {
        return {
            teamId: link.teamId,
            name: link.teamName
        };
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.put('/rooms/:roomId/details', passport.authenticate('basic'), function(req, res, next) {
    c.send('update-room-details', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.del('/rooms/:roomId', passport.authenticate('basic'), function(req, res, next) {
    c.send('remove-room', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});
