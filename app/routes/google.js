const router = require('express').Router()

const calendar = require("../google/services/calendar")
const drive = require("../google/services/drive")
const people = require("../google/services/people")
const gmail = require("../google/services/gmail")

const { saveCalendar } = require("../utils/calendar")

router.get("/people", async (req, res) => {
	let peopleInfo = await people.getPeopleInformation()
	res.send(peopleInfo)
})

router.get("/calendar", async (req, res) => {
	let events = await calendar.getCalendarEvents()
	res.send(events)
})

router.get("/drive", async (req, res) => {
	let filesLinks = await drive.getDriveFiles()
	res.send(filesLinks)
})

router.get("/gmail", async (req, res) => {
	let messages = await gmail.getMails()
	res.send(messages)
})

module.exports = router
