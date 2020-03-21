const router = require("express").Router();
const axios = require("axios");

const config = require("../../config/config.json");
const redis = require("../redis/redis")
const google = require("../google/google");
const { getJwtToken } = require("../utils/login")


router.get("/loggedTo", async (req, res) => {
	let tokens = await redis.retrieveData(req.session.token, "", "tokens")

	let services = []
	for (let service in tokens) {
		if (tokens[service]) {
			services.push(service)
		}
	}

	res.send(services);
});

// Req.body.services Array of String
// Ex: ['facebook', 'google']
router.post("/logout", async (req, res) => {
	let promises = []
	for (let service of req.body.services) {
		promises.push(redis.storeData(req.session.token, "tokens", service, ""))
	}
	await Promise.all(promises)

	res.sendStatus(200);
});

router.get("/googleToken", async (req, res) => {
	try {
		let { tokens } = await google.oauth2Client.getToken(req.query.code);
		if (tokens) {
			if (!req.session.token) {
				// TODO
				let token = getJwtToken("etienne.turc@gmail.com")
				await redis.createNewSession(token)
				req.session.token = token
				req.session.save()
			}

			await redis.storeData(token, "tokens", "google", tokens.access_token)
			utils.startProcessing()

			res.sendStatus(200);
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

		if (response.data) {
			if (!req.session.token) {
				// TODO
				let token = getJwtToken("etienne.turc@gmail.com")
				await redis.createNewSession(token)
				req.session.token = token
				req.session.save()
			}

			await redis.storeData(token, "tokens", "facebook", response.data.access_token)
			res.sendStatus(200);
		} else {
			res.sendStatus(401);
		}
	} catch (err) {
		res.sendStatus(401);
	}
});

module.exports = router;
