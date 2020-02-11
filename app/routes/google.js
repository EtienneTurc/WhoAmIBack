const router = require('express').Router()

const calendar = require("../google/services/calendar")
const drive = require("../google/services/drive")
const people = require("../google/services/people")
const gmail = require("../google/services/gmail")

router.get("/people", async (req, res) => {
	let peopleInfo = await people.getPeopleInformation()
	// console.log("peopleInfo", peopleInfo)
	res.send(peopleInfo)
})

router.get("/calendar", async (req, res) => {
	let events = await calendar.getCalendarEvents()
	// console.log("events", events)
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

router.get("/", async (req, res) => {
	let promises = []
	promises.push(people.getPeopleInformation())
	promises.push(calendar.getCalendarEvents())
	promises.push(gmail.getMails())

	let result = await Promise.all(promises)

	res.send({ people: result[0], calendar: result[1], gmail: result[2] })
})

module.exports = router
