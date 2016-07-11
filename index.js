'use strict';

const express = require('express');
const app = express();

const request = require('request');
const rethinkdb = require('rethinkdbdash')();
//rethinkdb.dbCreate('scrobble').run();
//rethinkdb.db('scrobble').tableCreate('user_games').run();
// rethinkdb.db('scrobble').table('user').insert({
// 	id: 1,
// 	name: 'Paulo'
// }).run();

const STEAM_KEY = 'CFEBF76E285C930F8999CA701716C81A';
const STEAM_URL = 'http://api.steampowered.com/';
const STEAM_GET_USER = `${ STEAM_URL }ISteamUser/ResolveVanityURL/v0001/?key=${ STEAM_KEY }&vanityurl=`;

let STEAM_USER = '';

app.get('/', (req, res) => {
	res.send('Access /steam/yourusername for more information');
});

app.get('/netflix', (req, res) => {

});

app.get('/steam/:user', (req, res) => {
	request(STEAM_GET_USER + req.params.user, (error, response, body) => {
		if (!error && response.statusCode == 200) {
			let data = JSON.parse(body);

			STEAM_USER = data.response.steamid;

			const STEAM_OWNED_GAMES = `${ STEAM_URL }IPlayerService/GetOwnedGames/v0001/?key=${ STEAM_KEY }&steamid=${ STEAM_USER }&format=json`;

			request(STEAM_OWNED_GAMES, (error, response, body) => {
				let apps = JSON.parse(body);
				for (var i = 0; i < apps.response.games.length; i++) {
					console.log(apps.response.games[i].appid);
					rethinkdb.db('scrobble').table('user_games').insert({
						game_id: apps.response.games[i].appid,
						playtime_forever: apps.response.games[i].playtime_forever,
						platform: 'steam'
					}).run();
				}
				res.send(body);
			})
		}
	});
});

app.listen(3000, () => {
	console.log('Scrobble API!');
});