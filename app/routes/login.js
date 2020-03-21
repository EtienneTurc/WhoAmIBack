const router = require("express").Router();

const config = require("../../config/config.json");
const redis = require("../redis/redis")

const google = require("../google/google");
const axios = require("axios");

router.get("/loggedTo", async (req, res) => {
	console.log(
		"logged to ",
		config.services.filter(s => s in req.session)
	);

	res.send(config.services.filter(s => s in req.session));
});

// Req.body.services Array of String
// Ex: ['facebook', 'google']
router.post("/logout", async (req, res) => {
	for (let service of req.body.services) {
		if (config.services.includes(service) && req.session[service]) {
			delete req.session[service];
			req.session.save();
		}
	}
	res.send(config.services.filter(s => s in req.session));
});

router.get("/googleToken", async (req, res) => {
	try {
		let { tokens } = await google.oauth2Client.getToken(req.query.code);
		if (tokens) {
			req.session.google = tokens;
			req.session.save();

			await redis.createNewSession(tokens.access_token)
			utils.startProcessing()

			res.send(tokens);
		} else {
			res.sendStatus(401);
		}
	} catch (err) {
		res.sendStatus(401);
	}
});

router.get("/facebookToken", async (req, res) => {
	try {
		let response = await axios.get(
			"https://graph.facebook.com/v6.0/oauth/access_token",
			{
				params: {
					client_id: config.facebook.clientID,
					redirect_uri: config.facebook.redirectUrl,
					client_secret: config.facebook.clientSecret,
					code: req.query.code
				}
			}
		);

		req.session.facebook = response.data;
		req.session.save();

		if (response.data) {
			res.send(response.data);
		} else {
			res.sendStatus(401);
		}
	} catch (err) {
		res.sendStatus(401);
	}
});

module.exports = router;
