const redis = require("../redis/redis")
const { broker } = require("../utils/broker")
const utils = require("../utils/utils")

let analyseUser = async function (token) {
	try {
		// console.log("facebook user id")
		let user = await redis.retrieveData(token, "raw.facebook", "user")
		// console.log(user)
		await redis.addDataToStore(token, "toDisplay.id", "data", { picture: user.picture })
		utils.stopProcessing(token, "toDisplay.id", "facebook", "user")

		broker.publish("toDisplay/id", JSON.stringify({ token: token }))
	} catch (err) {
		console.log(err)
	}
};

broker.listenTo("raw/facebook/user", analyseUser)
