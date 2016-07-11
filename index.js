'use strict';

const express = require('express');
const app = express();

global.request = require('request');

var firebase = require("firebase");
firebase.initializeApp({
	databaseURL: "https://scrooble-d7508.firebaseio.com",
	serviceAccount: "Scrobble-ce91ef246029.json"
});

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/scrobble');

global.database = firebase.database();
global.tables = {
	users: global.database.ref("users"),
	games: global.database.ref('games')
};

app.get('/', (req, res) => {
	res.send('Access /steam or /goodreads');
});

app.use('/steam', require('./routes/steam'));
app.use('/goodreads', require('./routes/goodreads'));

app.listen(3000, () => {
	console.log('Scrobble API!');
});