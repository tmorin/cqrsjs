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

server.put('/persons/:personId/details', function(req, res, next) {
    c.send('update-person-details', {
        personId: req.params.personId,
        name: req.params.name
    }, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

server.del('/persons/:personId', function(req, res, next) {
    c.send('remove-person', {
        personId: req.params.personId
    }, {
        userId: 'admin'
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});
