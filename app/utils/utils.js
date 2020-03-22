const fs = require('fs');
const Batchelor = require('batchelor');
const { broker } = require("./broker")
const redis = require('../redis/redis')

exports.check = (el, status, message) => {
	if (!el) throw { status, message }
}

exports.saveJson = async (fileName, json) => {
	await fs.writeFile(fileName, JSON.stringify(json), function (err) {
		if (err) {
			console.log(err);
		}
		console.log("The file was saved!");
	});
}

exports.createBatch = (uri, method, token) => {
	return new Batchelor({
		'uri': uri, //'https://www.googleapis.com/batch/gmail/v1',
		'method': method,
		'auth': {
			'bearer': token
		},
		'headers': {
			'Content-Type': 'multipart/mixed'
		}
	});
}

exports.startProcessing = (token) => {
	redis.storeProcessing(token, "google", "people")
	redis.storeProcessing(token, "google", "mail")
	redis.storeProcessing(token, "facebook", "user")

	let message = JSON.stringify({ token: token })
	broker.publish("start/google/mail", message)
	broker.publish("start/google/people", message)
	broker.publish("start/facebook/user", message)
}
