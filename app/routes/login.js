const router = require('express').Router()

const config = require("../../config/config.json")
const URL = require('url').URL

const google = require("../google/google")


router.get("/google", (req, res) => {
	let consent_url = google.getConsentUrl()
	res.send(consent_url)
})

module.exports = router
