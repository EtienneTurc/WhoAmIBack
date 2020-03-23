const router = require("express").Router();
const redis = require("../redis/redis")

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

router.get('/id', async (req, res) => {
	let data = await redis.retrieveData(req.session.token, "toDisplay", "id")

	let response = {}
	response.meta = getMeta(data)
	if (response.meta.available) {
		response.data = data.data
	}

	res.send(response)
})

const dashboardData = ["mails", "lydia", "amazon"]
router.get('/dashboard', async (req, res) => {
	let promises = []
	for (let d of dashboardData) {
		promises.push(redis.retrieveData(req.session.token, "toDisplay", d))
	}

	let data = await Promise.all(promises)
	console.log("data", data)

	let response = {}
	for (let i in dashboardData) {
		let key = dashboardData[i]
		let value = data[i]
		response[key] = { meta: getMeta(value) }

		if (response[key].meta.available) {
			response[key].data = value.data
		}
	}
	console.log("response", response)
	res.send(response)
})

module.exports = router
