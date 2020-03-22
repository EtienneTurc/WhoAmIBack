const redis = require("../redis/redis")
const { broker } = require("../utils/broker")

let analysePeople = async function (token) {
	let people = await redis.retrieveData(token, "raw.google", "people")

	await redis.storeData(token, "toDisplay.id", "data", people)
	broker.publish("toDisplay/mails", JSON.stringify({ token: token }))
};

broker.listenTo("raw/google/people", analysePeople)
