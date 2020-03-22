const redis = require("redis");
const client = redis.createClient();
const store = require("../../config/store.json")
const services = require("../../config/services")

const { setData, getData, exists } = require("./utils")

let createNewUser = function (token) {
	return setData(client, token, "", store)
}

let checkIfUserExists = function (token) {
	return exists(client, token)
}

let storeData = function (token, path, key, value) {
	path = path.replace(/^\./, '');
	path = path.replace(/\.$/, '');
	return setData(client, token, `${path}.${key}`, value)
}

let storeProcessing = function (token, service, subservice) {
	for (let s of services[service][subservice]) {
		setData(client, token, `toDisplay.${s}.meta`, { processing: true })
	}
}

let retrieveData = function (token, path, key) {
	path = trimPoint(path)
	key = trimPoint(key)
	let p = trimPoint(`${path}.${key}`)
	return getData(client, token, p)
}

let trimPoint = function (str) {
	str = str.replace(/^\./, '');
	str = str.replace(/\.$/, '');
	return str
}

module.exports = { createNewUser, checkIfUserExists, storeData, retrieveData, storeProcessing }
