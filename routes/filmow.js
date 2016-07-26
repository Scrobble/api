const express = require('express');
const router = express.Router();
const cheerio = require('cheerio');

router.post('/', (req, res) => {
	var movies = [];

	var types = [
		'filmes/ja-vi', 'filmes/quero-ver', 
		'series/ja-vi', 'series/quero-ver'
	];

	var typeIndex = 0;

	function loadPage (type, page) {
		console.log('Page', page, 'Type', type);

		if (!movies[type]) {
			movies[type] = [];
		}

		global.request.get(`https://filmow.com/usuario/${ req.body.user }/${ types[type] }/?pagina=${ page }`, function (error, response, body) {
			$ = cheerio.load(body);

			if ($("title").text().indexOf('Error 404') < 0) {
				$("#movies-list li").each(function (i, el) {
					var element = cheerio.load(el);
					movies[type].push(element("span a h3 span").text());
				});

				loadPage(type, ++page);
			} else {
				type++;

				if (type < 4) {
					loadPage(type, 1);
				} else {
					finish(page, movies);	
				}
			}
		});
	}

	loadPage(0, 1);

	function finish (page, movies) {
		global.tables.users.child(req.body.uid).update({
			filmow: req.body.user
		});

		var lists = {
			'alreadySaw': movies[0],
			'wannaSee': movies[1],
		}

		global.tables.movies.child(req.body.uid).set(lists, function (error) {
			console.log(error);
		});

		var lists2 = {
			'alreadySaw': movies[2],
			'wannaSee': movies[3],
		}

		global.tables.tvshows.child(req.body.uid).set(lists2, function (error) {
			console.log(error);
		});

		res.send(movies);
	}
});

module.exports = router;