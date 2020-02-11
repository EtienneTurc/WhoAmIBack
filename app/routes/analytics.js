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
// router.get("/simple", async (req, res) => {
// 	promises = []
// 	promises.push(people.getPeopleInformation())
// 	promises.push(calendar.getCalendarEvents())
// 	promises.push(gmail.getMails())

// 	let result = await Promise.all(promises)

// 	res.send({ people: result[0], calendar: result[1], gmail: result[2] })
// })
module.exports = router
