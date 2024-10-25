import { router, socket } from '../routes.js';

export default function renderScreen1() {
	const app = document.getElementById('app');

	app.innerHTML = `
		<div class="results-container">
			<h2 class="results-title">Game Results</h2>
			<div id="winner-announcement"></div>
			<div class="sort-buttons">
				<button id="sortAlpha" class="sort-btn">Sort by Name</button>
				<button id="sortScore" class="sort-btn">Sort by Score</button>
			</div>
			<ul id="scores-list" class="scores-list"></ul>
		</div>
		<button id="reset game" class="reset">reset all</button>
	`;

	let players = [];

	socket.on('notifyGameOver', (data) => {
		console.log('Received notifyGameOver event:', data);
		players = data.updatedPlayers;
		const winnerAnnouncement = document.getElementById('winner-announcement');

		// Clear the winner announcement if the game was reset
		if (data.winner === null) {
			winnerAnnouncement.innerHTML = ''; // Clear announcement
		} else {
			const winner = players.find((player) => player.points >= 100);
			if (winner) {
				winnerAnnouncement.innerHTML = `
					<div class="winner-message">
						¡Felicidades ${winner.nickname}!
						🎉 ¡Has ganado el juego! 🏆
					</div>
				`;
			}
		}

		renderPlayersList(players);
	});

	document.getElementById('sortAlpha').addEventListener('click', () => {
		players.sort((a, b) => a.nickname.localeCompare(b.nickname));
		renderPlayersList(players);
	});

	document.getElementById('sortScore').addEventListener('click', () => {
		players.sort((a, b) => b.points - a.points);
		renderPlayersList(players);
	});

	document.getElementById('reset game').addEventListener('click', () => {
		socket.emit('resetGame');
	});
}

function renderPlayersList(players) {
	const scoresList = document.getElementById('scores-list');
	scoresList.innerHTML = '';

	players.forEach((player) => {
		const scoreItem = document.createElement('li');
		scoreItem.textContent = `${player.nickname}: ${player.points} points`;
		scoresList.appendChild(scoreItem);
	});
}
