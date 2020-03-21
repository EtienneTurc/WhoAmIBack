const axios = require("axios");
const redis = require("../redis/redis")
const { broker } = require("../utils/broker")

let getAndStoreUser = async function (token) {
	let me = await axios.get("https://graph.facebook.com/v6.0/me/", {
		params: {
			fields: "first_name,picture.type(large),hometown,location",
			access_token: token
		}
	});

	await redis.storeData(token, "raw.facebook", "user", me.data)
	broker.publish("raw/facebook/user", JSON.stringify({ token: token }))
};

broker.listenTo("start/facebook/user", getAndStoreUser)

exports.basicFeed = async function (token) {
	try {
		let me = await axios.get("https://graph.facebook.com/v6.0/me/feed", {
			params: {
				fields: "caption,description,message,full_picture,place,targeting,type",
				access_token: token
			}
		});
		for (let el of me.data.data) {
			if (el.targeting) {
				// console.log("targeting", el.targeting)
			}
		}
		return me.data;
	} catch (err) {
		console.log(err);
	}
};

exports.checkFacebookLogin = (req, res, next) => {
	try {
		if (!req.session.facebook) {
			res.sendStatus(401); // Unauthorized
		} else {
			next();
		}
	} catch (err) {
		// console.log(err)
		res.send(err);
	}
};
