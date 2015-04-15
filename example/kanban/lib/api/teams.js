var passport = require('passport');
var http = require('../server').http;
var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

http.post('/teams', passport.authenticate('basic'), function(req, res, next) {
    c.send('add-team', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.get('/teams/:teamId', passport.authenticate('basic'), function(req, res, next) {
    c.call('get-team', req.params.teamId).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.get('/teams/:teamId/persons', passport.authenticate('basic'), function(req, res, next) {
    c.call('get-team', req.params.teamId).then(function() {
        return c.call('list-members-from-team', req.params.teamId).then(function(members) {
            return members.map(function(member) {
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

http.put('/teams/:teamId/details', passport.authenticate('basic'), function(req, res, next) {
    c.send('update-team-details', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});

http.del('/teams/:teamId', passport.authenticate('basic'), function(req, res, next) {
    c.send('remove-team', req.params, {
        userId: req.user.personId
    }).then(function(payload) {
        res.json(payload);
    }, function(error) {
        res.json(500, error);
    });
    return next();
});
