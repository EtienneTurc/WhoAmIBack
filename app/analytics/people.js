const redis = require("../redis/redis")
const { broker } = require("../utils/broker")
const utils = require("../utils/utils")

let analysePeople = async function (token) {
	try {
		let people = await redis.retrieveData(token, "raw.google", "people")

		await redis.addDataToStore(token, "toDisplay.id", "data", people)
		utils.stopProcessing(token, "toDisplay.id", "google", "people")

		broker.publish("toDisplay/people", JSON.stringify({ token: token }))
	} catch (err) {
		console.log(err)
	}
};

broker.listenTo("raw/google/people", analysePeople)
