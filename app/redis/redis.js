const redis = require("redis");
const client = redis.createClient();
const store = require("../../config/store.json")
const services = require("../../config/services")

const { setData, getData } = require("./utils")

let createNewUser = function (token) {
	setData(client, token, "", store)
	getData(client, token, "")
}

let storeData = function (token, path, key, value) {
	path = path.replace(/^\./, '');
	path = path.replace(/\.$/, '');
	setData(client, token, `${path}.${key}`, value)
}

let storeProcessing = function (token, service, subservice) {
	for (let s of services[service][subservice]) {
		setData(client, token, `toDisplay.${s}.meta`, { processing: true })
	}
}

// storeData()
// createNewUser("doc")

module.exports = { createNewUser, storeData }
