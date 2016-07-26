'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

const firebase = require("firebase");
firebase.initializeApp({
	databaseURL: "https://scrooble-d7508.firebaseio.com",
	serviceAccount: "Scrobble-ce91ef246029.json"
});

const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/scrobble');

global.sha512 = require('sha512');
global.request = require('request');
global.database = firebase.database();
global.tables = {
	users: global.database.ref("users"),
	games: global.database.ref('games'),
	movies: global.database.ref('movies'),
	tvshows: global.database.ref('tvshows'),
};

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/api/users', require('./routes/users'));
app.use('/api/filmow', require('./routes/filmow'));
app.use('/api/steam', require('./routes/steam'));
app.use('/api/goodreads', require('./routes/goodreads'));

app.listen(3000, () => {
	console.log('Scrobble API!');
});