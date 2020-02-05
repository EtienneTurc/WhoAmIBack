const router = require('express').Router()
// const axios = require('axios');
const config = require('../../config/config')

const calendar = require("../google/services/calendar")
const drive = require("../google/services/drive")
const people = require("../google/services/people")
const gmail = require("../google/services/gmail")

// With server flask
// router.get("/", async (req, res) => {
// 	axios.get(config.kite_url + '/analytics')
// 		.then(function (response) {
// 			res.send(response)
// 		})
// 		.catch(function (error) {
// 			// handle error
// 			console.log(error);
// 		})
// 		.finally(function () {
// 			// always executed
// 		});
// 	res.send(error)
// })

// Without
router.get("/simple", async (req, res) => {
	promises = []
	promises.push(gmail.getMails())
	promises.push(calendar.getCalendarEvents())

	let result = await Promise.all(promises)
	let mails_received = result[0][1]
	let mails_sent = result[0][1]
	let events = result[1]

	// let locations = calendar.getEventLocations(ev)

	res.send({ mails: { received: { length: mails_received.length }, sent: { length: mails_sent.length } }, events: { length: events.length } })
})
module.exports = router
