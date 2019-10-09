const router = require('express').Router()

const google = require("../google/google")
const calendar = require("../google/services/calendar")


router.get("/login", (req, res) => {
	let consent_url = google.getConsentUrl()
	console.log(consent_url)
	res.redirect(consent_url)
})

router.get("/", async (req, res) => {
	try {
		let code = req.query.code
		await google.setToken(code)
		res.redirect("/calendar")
	} catch (error) {
		res.send(error)
	}
})

router.get("/calendar", async (req, res) => {
	try {
		let events = await calendar.getCalendarEvents()
		console.log(events)
		res.send(events)
	} catch (error) {
		res.send(error)
	}
})


module.exports = router
