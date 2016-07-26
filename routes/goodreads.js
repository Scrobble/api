const express = require('express');
const router = express.Router();

const GoodReads = require('goodreads');
const goodreads = new GoodReads.client({ 'key': 'WYhzQzXHjay8k1prEFk4pw', 'secret': 'fSDwxGz4B11dDQOaTdP6G7N5hHj5ZZbp4VGcuEL0Zc' });

let oauthToken = '';
let oauthTokenSecret = '';

router.get('/oauth/:user', (req, res) => {
	goodreads.requestToken((callback) => {
		let data = {
			oauthToken: callback.oauthToken, 
			oauthTokenSecret: callback.oauthTokenSecret,
			url: callback.url.replace('localhost:3000/callback', 'localhost:3000/api/goodreads/oauth/callback')
		};

		oauthToken = data.oauthToken;
		oauthTokenSecret = data.oauthTokenSecret;

		res.send(data);
	})
});

router.get('/oauth/callback/:uid', (req, res) => {
	goodreads.processCallback(oauthToken, oauthTokenSecret, req.query.authorize, (callback) => {
		global.tables.users.child(req.params.uid).update({
			goodreads: callback.userid
		});

		res.send(JSON.stringify(callback));
	});
});

router.post('/shelves', (req, res) => {
	let index = 0;
	let books = {};

	global.tables.users.child(req.body.user).child('goodreads').on('value', (user) => {
		goodreads.getShelves(user.val(), (shelves) => {
			getBooks(shelves, index, user);
		});
	});

	function getBooks (shelves, index, user) {
		let name = shelves.GoodreadsResponse.shelves[0].user_shelf[index].name[0];

		if (!books[name]) {
			books[name] = [];
		}

		console.log(name);

		goodreads.getSingleShelf({
			'userID': user.val(),
			'shelf': name,
			'page': 1,
			'per_page': 100
		}, (shelf) => {
			
			for (var i = 0; i < shelf.GoodreadsResponse.books[0].book.length; i++) {
				books[name].push(shelf.GoodreadsResponse.books[0].book[i].title[0]);
			}

			index++;

			if (index < shelves.GoodreadsResponse.shelves[0].user_shelf.length) {
				getBooks(shelves, index, user);
			} else {
				res.send(books);
			}
		});
	}
});

module.exports = router;