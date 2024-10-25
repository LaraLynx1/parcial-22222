// gameHandlers.js

const { assignRoles } = require('../utils/helpers');

// Assuming db and io are required or passed in some way to be accessible
const joinGameHandler = (socket, db, io) => {
	return (user) => {
		db.players.push({ id: socket.id, points: 0, ...user });
		console.log(db.players);
		io.emit('userJoined', db); // Broadcasts the message to all connected clients including the sender
	};
};

const startGameHandler = (socket, db, io) => {
	return () => {
		if (!db.players || db.players.length === 0) {
			console.log('No players to assign roles.');
			return;
		}

		// Preserve existing points
		const existingPoints = db.players.reduce((acc, player) => {
			acc[player.id] = player.points;
			return acc;
		}, {});

		// Reassign roles but keep points
		db.players = assignRoles(db.players).map((player) => ({
			...player,
			points: existingPoints[player.id] || 0,
		}));

		db.players.forEach((element) => {
			io.to(element.id).emit('startGame', element.role);
		});
	};
};

const notifyMarcoHandler = (socket, db, io) => {
	return () => {
		const rolesToNotify = db.players.filter((user) => user.role === 'polo' || user.role === 'polo-especial');

		rolesToNotify.forEach((element) => {
			io.to(element.id).emit('notification', {
				message: 'Marco!!!',
				userId: socket.id,
			});
		});
	};
};

const notifyPoloHandler = (socket, db, io) => {
	return () => {
		const rolesToNotify = db.players.filter((user) => user.role === 'marco');

		rolesToNotify.forEach((element) => {
			io.to(element.id).emit('notification', {
				message: 'Polo!!',
				userId: socket.id,
			});
		});
	};
};

const onSelectPoloHandler = (socket, db, io) => {
	return (userID) => {
		const myUser = db.players.find((user) => user.id === socket.id);
		const poloSelected = db.players.find((user) => user.id === userID);
		const poloEspecial = db.players.find((user) => user.role === 'polo-especial');

		let message = '';
		let winner = null;

		if (poloSelected.role === 'polo-especial') {
			// Marco atrapa al polo especial
			myUser.points += 50; // Solo suma 50 puntos una vez
			poloSelected.points -= 10; // El polo especial pierde 10 puntos
			message = `El marco "${myUser.nickname}" encontró al polo especial "${poloSelected.nickname}". ¡Marco gana 50 puntos y Polo especial pierde 10 puntos!`;
		} else {
			// Marco no atrapa al polo especial
			myUser.points -= 10; // Marco pierde 10 puntos
			if (poloEspecial) {
				poloEspecial.points += 10; // Polo especial gana 10 puntos
				message = `El marco ${myUser.nickname} seleccionó a "${poloSelected.nickname}". "${poloEspecial.nickname}" (polo especial) obtiene 10 puntos y Marco pierde 10 puntos!`;
			} else {
				message = `El marco "${myUser.nickname}" atrapó a "${poloSelected.nickname}" pero no era el polo especial. Marco pierde 10 puntos`;
			}
		}

		// Verificar si hay ganador
		db.players.forEach((player) => {
			if (player.points >= 100) {
				winner = player;
			}
		});

		// Mensaje de final de juego si hay un ganador
		if (winner) {
			// Ordenar jugadores por puntos de mayor a menor
			const sortedPlayers = [...db.players].sort((a, b) => b.points - a.points);
			const rankingMessage = sortedPlayers
				.map((player, index) => `${index + 1}. ${player.nickname} (${player.points} pts)`)
				.join(', ');
			message = `¡"${winner.nickname}" es el ganador con ${winner.points} puntos!\nRanking final: ${rankingMessage}`;
		}

		// Emitir el resultado
		io.emit('notifyGameOver', {
			message: message,
			updatedPlayers: db.players,
			winner: winner,
		});
	};
};

const resetGameHandler = (socket, db, io) => {
	return () => {
		db.players = []; // Clear all players
		io.emit('notifyGameOver', {
			message: 'Game has been reset. All scores and players cleared.',
			updatedPlayers: [],
			winner: null,
		});
	};
};

module.exports = {
	joinGameHandler,
	startGameHandler,
	notifyMarcoHandler,
	notifyPoloHandler,
	onSelectPoloHandler,
	resetGameHandler,
};
