var passport = require('passport');
var http = require('../server').http;
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

http.post('/persons', passport.authenticate('basic'), function(req, res, next) {
    c.send('add-person', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.get('/persons/:personId', passport.authenticate('basic'), function(req, res, next) {
    c.call('get-person', req.params.personId).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.get('/persons/:personId/teams', passport.authenticate('basic'), function(req, res, next) {
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

http.put('/persons/:personId/details', passport.authenticate('basic'), function(req, res, next) {
    c.send('update-person-details', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.del('/persons/:personId', passport.authenticate('basic'), function(req, res, next) {
    c.send('remove-person', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});
