const axios = require("axios");
const redis = require("../redis/redis")
const { broker } = require("../utils/broker")

let getAndStoreUser = async function (token) {
	try {
		let facebookToken = await redis.retrieveData(token, "tokens", "facebook")

		let me = await axios.get("https://graph.facebook.com/v6.0/me/", {
			params: {
				fields: "picture.type(large)",
				// fields: "first_name,picture.type(large),hometown,location",
				access_token: facebookToken
			}
		});
		await redis.storeJson(token, "raw.facebook", "user", me.data)
		broker.publish("raw/facebook/user", JSON.stringify({ token: token }))
	} catch (err) {
		console.log(err)
	}
};
broker.listenTo("start/facebook/user", getAndStoreUser)
