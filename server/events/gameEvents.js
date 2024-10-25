const db = require('../db');
const {
	joinGameHandler,
	startGameHandler,
	notifyMarcoHandler,
	notifyPoloHandler,
	onSelectPoloHandler,
	resetGameHandler, // Import the reset handler
} = require('../event-handlers/gameHandlers');
const { assignRoles } = require('../utils/helpers');

const gameEvents = (socket, io) => {
	socket.on('joinGame', joinGameHandler(socket, db, io));

	socket.on('startGame', startGameHandler(socket, db, io));

	socket.on('notifyMarco', notifyMarcoHandler(socket, db, io));

	socket.on('notifyPolo', notifyPoloHandler(socket, db, io));

	socket.on('onSelectPolo', onSelectPoloHandler(socket, db, io));

	// Add the reset event listener here
	socket.on('resetGame', resetGameHandler(socket, db, io));
};

module.exports = { gameEvents };
