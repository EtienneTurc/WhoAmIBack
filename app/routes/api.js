const router = require('express').Router()

const google = require("../google/google")
const calendar = require("../google/services/calendar")
const drive = require("../google/services/drive")


router.get("/login", (req, res) => {
	let consent_url = google.getConsentUrl()
	res.redirect(consent_url)
})

router.get("/", async (req, res) => {
	try {
		let code = req.query.code
		await google.setToken(code)
		res.redirect("/drive")
	} catch (error) {
		res.send(error)
	}
})

router.get("/calendar", async (req, res) => {
	try {
		let events = await calendar.getCalendarEvents()
		res.send(events)
	} catch (error) {
		res.send(error)
	}
})

router.get("/drive", async (req, res) => {
	try {
		let filesLinks = await drive.getDriveFiles()
		res.send(filesLinks)
	} catch (error) {
		res.send(error)
	}
})

module.exports = router
