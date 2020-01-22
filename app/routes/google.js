const router = require('express').Router()

const calendar = require("../google/services/calendar")
const drive = require("../google/services/drive")
const people = require("../google/services/people")
const gmail = require("../google/services/gmail")

const { saveCalendar } = require("../utils/calendar")

router.get("/people", async (req, res) => {
	try {
		let peopleInfo = await people.getPeopleInformation()
		res.send(peopleInfo)
	} catch (error) {
		res.send(error)
	}
})


router.get("/calendar", async (req, res) => {
	try {
		let events = await calendar.getCalendarEvents()
		// Keeps only the events and concatenate them
		events = events.reduce((acc, e) => acc.concat(e.data.items), [])
		// saveCalendar("calendar.txt", events)
		res.send({ "events": events })
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

router.get("/gmail", async (req, res) => {
	try {
		let messages = await gmail.getMails()
		res.send(messages)
	} catch (error) {
		res.send(error)
	}
})

module.exports = router
