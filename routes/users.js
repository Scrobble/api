const express = require('express');
const router = express.Router();
const cheerio = require('cheerio');

router.post('/login', (req, res) => {
	global.tables.users.orderByChild('email').on('value', (users) => {
		res.send(users.val());
	})
});

router.post('/', (req, res) => {
	let email = req.body.email.split('@')[0].replace(/\./g, '').toLowerCase();

	global.tables.users.orderByChild('email').equalTo(req.body.email).once('value', function (snapshot) {
		if (snapshot.val() == null) {
			global.tables.users.child(email).set({
				name: req.body.name,
				email: req.body.email,
				password: global.sha512(req.body.password).toString('hex')
			}, function (error) {
				if (error) {
					res.send({ success: false, error: true, message: error });
				} else {
					res.send({ success: true, error: false });
				}
			});
		} else {
			res.send({ success: false, error: true, message: 'E-mail já cadastrado.' });
		}
	});
});

module.exports = router;