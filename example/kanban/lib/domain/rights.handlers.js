var cqrs = require('../../../../lib/cqrs');
var c = cqrs();

var rightsAgg = c.aggregate('rights');

rightsAgg.when('update-roles').invoke(function(payload, metadata) {
    return cqrs().call('check-right', 'manage-persons', metadata.userId).then(function() {
        return {
            personId: payload.personId,
            roles: payload.roles
        };
    });
}).apply('roles-updated');

/* QUERY */

var isAdmin = function(userId) {
    return c.call('has-role', userId, 'admin').then(function(result) {
        if (!result) {
            throw new Error('not allowed');
        }
        return true;
    });
};

var isMemberOfTeam = function(userId, teamId) {
    return c.call('is-person-member-of-team', userId, teamId).then(null, function() {
        throw new Error('not allowed');
    });
};

var isMemberOfTeamLinkedRoom = function(userId, roomId) {
    return function () {
        return Promise.all([c.call('get-room', roomId), c.call('list-members-from-person', userId)]).then(function(result) {
            return {
                fromRoom: result[0].teams,
                fromPerson: result[1].map(function(member) {
                    return member.teamId;
                })
            };
        }).then(function(teams) {
            var matchedTeams = teams.fromRoom.some(function(teamId) {
                return teams.fromPerson.indexOf(teamId) > -1;
            });
            if (!matchedTeams) {
                throw new Error('not allowed');
            }
            return true;
        });
    };
};

var controllers = {
    'manage-persons': function(userId) {
        // has role admin
        return isAdmin(userId);
    },
    'manage-person': function(userId, personId) {
        // has role admin
        // userId === personId
        return isAdmin(userId).then(null, function() {
            if (userId !== personId) {
                throw new Error('not allowed');
            }
            return true;
        });
    },
    'manage-teams': function(userId) {
        // has role admin
        return isAdmin(userId);
    },
    'manage-team': function(userId, teamId) {
        // has role admin
        // userId is member of teamId
        return isAdmin(userId).then(null, isMemberOfTeam(userId, teamId));
    },
    'manage-rooms': function(userId) {
        // has role admin
        return isAdmin(userId);
    },
    'manage-room': function(userId, roomId) {
        // has role admin
        // userId is member of teamId linked to roomId
        return isAdmin(userId).then(null, isMemberOfTeamLinkedRoom(userId, roomId));
    },
    'manage-boards': function(userId, roomId) {
        // has role admin
        // userId is member of teamId linked to roomId
        return isAdmin(userId).then(null, isMemberOfTeamLinkedRoom(userId, roomId));
    },
    'manage-board': function(userId, roomId) {
        // has role admin
        // userId is member of teamId linked to roomId
        return isAdmin(userId).then(null, isMemberOfTeamLinkedRoom(userId, roomId));
    },
    'manage-columns': function(userId, roomId) {
        // has role admin
        // userId is member of teamId linked to roomId
        return isAdmin(userId).then(null, isMemberOfTeamLinkedRoom(userId, roomId));
    },
    'manage-column': function(userId, roomId) {
        // has role admin
        // userId is member of teamId linked to roomId
        return isAdmin(userId).then(null, isMemberOfTeamLinkedRoom(userId, roomId));
    },
    'manage-cards': function(userId, roomId) {
        // has role admin
        // userId is member of teamId linked to roomId
        return isAdmin(userId).then(null, isMemberOfTeamLinkedRoom(userId, roomId));
    },
    'manage-card': function(userId, roomId) {
        // has role admin
        // userId is member of teamId linked to roomId
        return isAdmin(userId).then(null, isMemberOfTeamLinkedRoom(userId, roomId));
    }
};

c.calling('check-right').invoke(function(name) {
    var args = Array.prototype.slice.call(arguments);
    args.shift();
    return controllers[name].apply(controllers, args);
});