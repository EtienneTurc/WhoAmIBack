const axios = require("axios");
const redis = require("../redis/redis")

exports.basicInfo = async function (token) {
	try {
		redis.storeProcessing(token, "facebook", "user")
		let me = await axios.get("https://graph.facebook.com/v6.0/me/", {
			params: {
				fields: "first_name,picture.type(large),hometown,location",
				access_token: token
			}
		});
		redis.storeData(token, "raw.facebook", "user", me.data)
		return me.data;
	} catch (err) {
		console.log(err);
	}
};

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
