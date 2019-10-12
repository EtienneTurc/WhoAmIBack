const router = require('express').Router()

const config = require("../../config/config.json")
const URL = require('url').URL

const google = require("../google/google")
const calendar = require("../google/services/calendar")
const drive = require("../google/services/drive")


router.get("/calendar", async (req, res) => {
	try {
		let events = await calendar.getCalendarEvents()
		events = events.map(e =>
			e.data.items
		)
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
