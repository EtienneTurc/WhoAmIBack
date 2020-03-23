const mqtt = require('mqtt')

let createClient = function () {
	let client = mqtt.connect('mqtt://localhost:1883')
	client.on('connect', function () {
		// for (let sub of Object.keys(subs)) {
		// 	client.subscribe(sub)
		// }

	})
	client.listenTo = function (channel, callback) {
		client.subscribe(channel)
		client.on('message', function (topic, message) {
			if (topic == channel) {
				let token = JSON.parse(message).token
				callback(token)
			}
		})
	}
	return client
}

const broker = createClient()

module.exports = { broker }

require("../google/fetch/gmail")
require("../google/fetch/people")
require("../facebook/facebook.js")
require("../analytics/mail.js")
require("../analytics/people.js")
