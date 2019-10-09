const router = require('express').Router()

const google = require("../google/google")


router.get("/login", (req, res) => {
	let consent_url = google.getConsentUrl()
	console.log(consent_url)
	res.redirect(consent_url)
})

router.get("/", (req, res) => {
	let code = req.query.code
	google.setToken(code)
	res.send(code)
})

router.get("/calendar", (req, res) => {
	google.getCalendarList()
	res.send("OK")
})


module.exports = router
