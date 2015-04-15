# Domain

The domain is built on top of _cqrs.js_.

## Persons

### Commands
- add a person
- remove a person
- update the person details

### Queries
- get a person

## Teams

### Commands
- add a team
- remove a team
- update the team details

### Query
- get a team

## Members

### Commands
- add member
- remove a member

### Queries
- is a person not member of a team
- is a person member of a team
- list members from a team
- list members from a person

## Rooms

### Commands
- add a room
- remove a room
- update the room details
- link a room to a team
- unlink a room to a team

### Queries
- get a room
- is a room not linked to a team
- is a room linked to a team

## Boards

### Commands
- add a board
- remove a board
- update the board details

### Queries
- get a board
- list boards from a room

## Columns

### Commands
- add a column
- remove a column
- update the column details
- update the columns order

### Queries
- get a column
- list columns from a board

## Cards

### Commands
- add a card
- remove a card
- update the card details
- update cards order
- move a card

### Queries
- get card
- list cards from a column

## Rights

### Queries
- check rights