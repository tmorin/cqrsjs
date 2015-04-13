var server = require('../server');
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

server.post('/rooms', function(req, res, next) {
    c.send('add-room', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.get('/rooms/:roomId', function(req, res, next) {
    c.call('get-room', req.params.roomId).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.post('/rooms/:roomId/links/:teamId', function(req, res, next) {
    c.send('link-room-to-team', req.params, {
        userId: 'admin'
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

server.del('/rooms/:roomId/links/:teamId', function(req, res, next) {
    c.send('unlink-room-to-team', req.params, {
        userId: 'admin'
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

server.put('/rooms/:roomId/details', function(req, res, next) {
    c.send('update-room-details', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.del('/rooms/:roomId', function(req, res, next) {
    c.send('remove-room', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});
