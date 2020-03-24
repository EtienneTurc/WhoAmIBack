const router = require("express").Router();
const redis = require("../redis/redis")

let getPromiseData = function (token, keys) {
	let promises = []
	for (let d of keys) {
		promises.push(redis.retrieveData(token, "toDisplay", d))
	}

	return promises
}

let getMeta = function (data) {
	let processes = data.meta.processing
	let res = { available: false, processing: false }
	for (let process in processes) {
		if (processes[process]) {
			res.processing = true
		} else {
			res.available = true
		}
	}
	return res
}

let formatResponse = function (data, keys) {
	let response = { meta: {}, data: {} }
	let tmp = {}
	for (let i in keys) {
		let key = keys[i]
		let value = data[i]
		tmp[key] = { meta: getMeta(value) }

		if (tmp[key].meta.available) {
			response.data[key] = { data: value.data }
		} else {
			response.meta.processing = true
		}
	}
	return response
}

router.get('/id', async (req, res) => {
	let data = await redis.retrieveData(req.session.token, "toDisplay", "id")

	let response = {}
	response.meta = getMeta(data)
	if (response.meta.available) {
		response.data = data.data
	}

	res.send(response)
})

const dashboardKeys = ["mails", "lydia", "amazon"]
router.get('/dashboard', async (req, res) => {
	let data = await Promise.all(getPromiseData(req.session.token, dashboardKeys))

	let response = formatResponse(data, dashboardKeys)
	res.send(response)
})

const mapKeys = ["uberRides", "uberEats", "uberBikes"]
router.get("/map", async (req, res) => {
	let promises = getPromiseData(req.session.token, mapKeys)
	promises.push(redis.retrieveData(req.session.token, "toDisplay.id", addresses))
	let data = Promise.all(promises)

	let mapKeysAugmented = mapKeys.concat(["addresses"])
	let response = formatResponse(data, mapDataAugmented)
	res.send(response)
})

const wordsKeys = ["words"]
router.get("/words", async (req, res) => {
	let data = await Promise.all(getPromiseData(req.session.token, wordsKeys))

	let response = formatResponse(data, wordsKeys)
	res.send(response)
})

module.exports = router
