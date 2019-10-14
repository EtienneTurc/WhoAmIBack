const router = require('express').Router()

const calendar = require("../google/services/calendar")
const drive = require("../google/services/drive")
const people = require("../google/services/people")


router.get("/people", async (req, res) => {
	try {
		let people_info = await people.getPeopleInformation()
		res.send(people_info)
	} catch (error) {
		res.send(error)
	}
})


router.get("/calendar", async (req, res) => {
	try {
		let events = await calendar.getCalendarEvents()
		events = events.map(e =>
			e.data.items
		)
		res.send({ "events": events, token: res.locals.token })
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
