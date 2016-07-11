const express = require('express');
const router = express.Router();

const GoodReads = require('goodreads');
const goodreads = new GoodReads.client({ 'key': 'WYhzQzXHjay8k1prEFk4pw', 'secret': 'fSDwxGz4B11dDQOaTdP6G7N5hHj5ZZbp4VGcuEL0Zc' });

let oauthToken = '';
let oauthTokenSecret = '';

router.get('/oauth', (req, res) => {
	goodreads.requestToken((callback) => {
		let data = {
			oauthToken: callback.oauthToken, 
			oauthTokenSecret: callback.oauthTokenSecret,
			url: callback.url.replace('localhost:3000/callback', 'localhost:3000/goodreads/oauth/callback')
		};

		oauthToken = data.oauthToken;
		oauthTokenSecret = data.oauthTokenSecret;

		res.send(data);
	})
});

router.get('/oauth/callback', (req, res) => {
	goodreads.processCallback(oauthToken, oauthTokenSecret, req.query.authorize, (callback) => {
		global.tables.users.child('paulomenezes').update({
			goodreads: callback.userid
		});

		res.send(JSON.stringify(callback));
	});
});

router.get('/shelves', (req, res) => {
	global.tables.users.child('paulomenezes').child('goodreads').on('value', (user) => {
		goodreads.getShelves(user.val(), (shelves) => {
			goodreads.getSingleShelf({
				'userID': user.val(),
				'shelf': shelves.GoodreadsResponse.shelves[0].user_shelf[0].id[0]._,
				'page': 1,
				'per_page': 100
			}, (shelf) => {
				res.send(shelf);
			});
		});
	});
});

module.exports = router;