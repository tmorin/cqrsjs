# IO API

The REST API is built on top of _socket.io_ and _passportjs_.

# name space /boards

Push any changes applied from a board to the cards.

## subscribe

Join board's io room.

```javascript
socket.emit('subscribe', 'a board id', function() {
    // the socket joined the board's io room
});
```

## unsubscribe

Leave board's io room.

```javascript
socket.emit('unsubscribe', 'a board id', function() {
    // the socket left the board's io room
});
```

## domain's event published

- board-details-updated
- board-removed
- column-added
- column-details-updated
- column-removed
- columns-order-updated
- card-added
- card-details-updated
- card-moved
- card-assigned
- card-removed
- cards-order-updated
