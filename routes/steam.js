const express = require('express');
const router = express.Router();

const STEAM_KEY = 'CFEBF76E285C930F8999CA701716C81A';
const STEAM_URL = 'http://api.steampowered.com/';
const STEAM_GET_USER = `${ STEAM_URL }ISteamUser/ResolveVanityURL/v0001/?key=${ STEAM_KEY }&vanityurl=`;

router.get('/', (req, res) => {
	global.tables.users.on('value', (users) => {
		res.send(users.val());
	})
});

router.get('/:user/:steam', (req, res) => {
	global.tables.users.child(req.params.user).set({
		steam: req.params.steam
	});

	global.request(STEAM_GET_USER + req.params.steam, (error, response, body) => {
		if (!error && response.statusCode == 200) {
			let data = JSON.parse(body);
			let STEAM_USER = data.response.steamid;

			const STEAM_OWNED_GAMES = `${ STEAM_URL }IPlayerService/GetOwnedGames/v0001/?key=${ STEAM_KEY }&steamid=${ STEAM_USER }&format=json`;

			global.request(STEAM_OWNED_GAMES, (error, response, body) => {
				let apps = JSON.parse(body);
				global.tables.users.child(req.params.user).update({
					steam_games: apps.response.games
				});
				res.send(body);
			})
		}
	});
});

module.exports = router;