const router = require("express").Router();
const redis = require("../redis/redis")


router.get('/:component', async (req, res) => {
	let component = req.params.component
	let data = await redis.retrieveData(req.session.google.access_token, "toDisplay", component)

	let response = {}
	response.processing = data.meta.processing
	response.done = data.meta.done
	response.error = data.meta.error

	if (data.meta.available) {
		response.data = data.data
	}

	res.send(response)
})

module.exports = router
