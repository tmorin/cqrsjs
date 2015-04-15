# REST API

The REST API is built on top of _restify_ and _passportjs_.

POST /rooms/:roomId/boards

GET /rooms/:roomId/boards

GET /rooms/:roomId/boards/:boardId

PUT /rooms/:roomId/boards/:boardId/details

DELETE /rooms/:roomId/boards/:boardId



POST /rooms/:roomId/boards/:boardId/columns/:columnId/cards

GET /rooms/:roomId/boards/:boardId/columns/:columnId/cards

GET /rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId

PUT /rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId/details

DELETE /rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId

PUT /rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId/assign

DELETE /rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId/assign

PUT /rooms/:roomId/boards/:boardId/columns/:columnId/cards/:cardId/move



POST /rooms/:roomId/boards/:boardId/columns

GET /rooms/:roomId/boards/:boardId/columns

GET /rooms/:roomId/boards/:boardId/columns/:columnId

PUT /rooms/:roomId/boards/:boardId/columns/:columnId/details

PUT /rooms/:roomId/boards/:boardId/columns/order

DELETE /rooms/:roomId/boards/:boardId/columns/:columnId



POST /members

DELETE /members



POST /persons

GET /persons/:personId

GET /persons/:personId/teams

PUT /persons/:personId/details

DELETE /persons/:personId



POST /rooms

GET /rooms/:roomId

POST /rooms/:roomId/links/:teamId

DELETE /rooms/:roomId/links/:teamId

PUT /rooms/:roomId/details

DELETE /rooms/:roomId



POST /teams

GET /teams/:teamId

GET /teams/:teamId/persons

PUT /teams/:teamId/details

DELETE /teams/:teamId