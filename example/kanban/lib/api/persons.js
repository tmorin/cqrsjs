var server = require('../server');
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

server.post('/persons', function(req, res, next) {
    c.send('add-person', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.get('/persons/:personId', function(req, res, next) {
    c.call('get-person', req.params.personId).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.get('/persons/:personId/teams', function(req, res, next) {
    c.call('get-person', req.params.personId).then(function () {
        return c.call('list-members-from-person', req.params.personId).then(function (members) {
            return members.map(function (member) {
                return {
                    teamId: member.teamId,
                    name: member.teamName
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

server.put('/persons/:personId/details', function(req, res, next) {
    c.send('update-person-details', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.del('/persons/:personId', function(req, res, next) {
    c.send('remove-person', req.params, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});
