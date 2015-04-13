var storage = require('../../lib/storage').local;

module.exports.reset = function() {
    storage.clear();
    storage.setItem('rights', JSON.stringify({
        admin: {
            personId: 'admin',
            roles: ['admin']
        }
    }));
    storage.setItem('persons', JSON.stringify({
        admin: {
            personId: 'admin',
            name: 'admin'
        },
        person0: {
            personId: 'person0',
            name: 'person0'
        },
        person1: {
            personId: 'person1',
            name: 'person1'
        }
    }));
    storage.setItem('teams', JSON.stringify({
        team0: {
            teamId: 'team0',
            name: 'team0'
        },
        team1: {
            teamId: 'team1',
            name: 'team1'
        }
    }));
    storage.setItem('members', JSON.stringify([{
        teamId: 'team0',
        teamName: 'team0',
        personId: 'person0',
        personName: 'person0'
    }]));
    storage.setItem('rooms', JSON.stringify({
        room0: {
            roomId: 'room0',
            name: 'room0',
            teams: ['team0']
        },
        room1: {
            roomId: 'room1',
            name: 'room1',
            teams: []
        }
    }));
    storage.setItem('boards', JSON.stringify({
        board0: {
            roomId: 'room0',
            boardId: 'board0',
            name: 'board0'
        },
        board1: {
            roomId: 'room0',
            boardId: 'board1',
            name: 'board1'
        }
    }));
    storage.setItem('columns', JSON.stringify({
        column0: {
            roomId: 'room0',
            boardId: 'board0',
            columnId: 'column0',
            name: 'column0'
        },
        column1: {
            roomId: 'room0',
            boardId: 'board0',
            columnId: 'column1',
            name: 'column1'
        }
    }));
    storage.setItem('cards', JSON.stringify({
        card0: {
            roomId: 'room0',
            boardId: 'board0',
            columnId: 'column0',
            cardId: 'card0',
            name: 'card0'
        },
        card1: {
            roomId: 'room0',
            boardId: 'board0',
            columnId: 'column0',
            cardId: 'card1',
            name: 'card1',
            assignee: 'person1',
            assigneeName: 'person1'
        }
    }));
};
