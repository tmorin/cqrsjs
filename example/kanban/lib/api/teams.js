var server = require('../server');
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

server.post('/teams', function(req, res, next) {
    c.send('add-team', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.get('/teams/:teamId', function(req, res, next) {
    c.call('get-team', req.params.teamId).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.get('/teams/:teamId/persons', function(req, res, next) {
    c.call('get-team', req.params.teamId).then(function () {
        return c.call('list-members-from-team', req.params.teamId).then(function (members) {
            return members.map(function (member) {
                return {
                    personId: member.personId,
                    name: member.personName
                };
            });
        });
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.put('/teams/:teamId/details', function(req, res, next) {
    c.send('update-team-details', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.del('/teams/:teamId', function(req, res, next) {
    c.send('remove-team', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});
