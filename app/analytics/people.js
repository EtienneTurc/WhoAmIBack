const redis = require("../redis/redis")
const { broker } = require("../utils/broker")

let analysePeople = async function (token) {
	try {
		let people = await redis.retrieveData(token, "raw.google", "people")

		await redis.storeData(token, "toDisplay.id", "data", people)
		broker.publish("toDisplay/mails", JSON.stringify({ token: token }))
	} catch (err) {
		console.log(err)
	}
};

broker.listenTo("raw/google/people", analysePeople)
