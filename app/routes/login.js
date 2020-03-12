const router = require('express').Router()

const config = require("../../config/config.json")

const google = require("../google/google")
const axios = require('axios')

router.get("/loggedTo", async (req, res) => {
	res.send(config.services.filter(s => s in req.session))
})

router.post("/logout", async (req, res) => {
	for (let q of req.query) {
		if (config.services.includes(q) && req.session[q]) {
			delete req.session[q]
		}
	}
	res.send(config.services.filter(s => s in req.session))
})

router.get("/googleToken", async (req, res) => {
	try {
		let { tokens } = await google.oauth2Client.getToken(req.query.code)
		req.session.google = tokens
		req.session.save()
		if (tokens) {
			res.send(tokens)
		} else {
			res.sendStatus(401)
		}
	} catch (err) {
		console.log(err)
		res.sendStatus(401)
	}
})

router.get("/facebookToken", async (req, res) => {
	try {
		let response = await axios.get("https://graph.facebook.com/v6.0/oauth/access_token", {
			params: {
				client_id: config.facebook.clientID,
				redirect_uri: config.facebook.redirectUrl,
				client_secret: config.facebook.clientSecret,
				code: req.query.code,
			}
		})

		req.session.facebook = response.data
		req.session.save()

		if (response.data) {
			res.send(response.data)
		} else {
			res.sendStatus(401)
		}
	} catch (err) {
		console.log(err)
		res.sendStatus(401)
	}
})

module.exports = router
