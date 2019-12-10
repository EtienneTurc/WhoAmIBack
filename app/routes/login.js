const router = require('express').Router()

const config = require("../../config/config.json")
const URL = require('url').URL

const google = require("../google/google")


router.get("/google", (req, res) => {
	let consent_url = google.getConsentUrl()
	res.send(consent_url)
})

router.get("/googleToken", async (req, res) => {
	try {
		let { tokens } = await google.oauth2Client.getToken(req.query.code)
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

module.exports = router
