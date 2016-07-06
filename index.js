'use strict';

const express = require('express');
const app = express();

const request = require('request');

const STEAM_KEY = 'CFEBF76E285C930F8999CA701716C81A';
const STEAM_URL = 'http://api.steampowered.com/';
const STEAM_GET_USER = `${ STEAM_URL }ISteamUser/ResolveVanityURL/v0001/?key=${ STEAM_KEY }&vanityurl=`;

let STEAM_USER = '';

app.get('/', function (req, res) {
	res.send('Access /steam/yourusername for more information');
});

app.get('/steam/:user', function (req, res) {
	request(STEAM_GET_USER + req.params.user, function (error, response, body) {
		if (!error && response.statusCode == 200) {
			let data = JSON.parse(body);

			STEAM_USER = data.response.steamid;

			const STEAM_OWNED_GAMES = `${ STEAM_URL }IPlayerService/GetOwnedGames/v0001/?key=${ STEAM_KEY }&steamid=${ STEAM_USER }&format=json`;

			request(STEAM_OWNED_GAMES, function (error, response, body) {
				res.send(body);
			})
		}
	});
});

app.listen(3000, function () {
	console.log('Scrobble API!');
});