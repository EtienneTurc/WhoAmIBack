const redis = require("../redis/redis")
const { broker } = require("../utils/broker")
const utils = require("../utils/utils")

let getDistribution = mails => {
	return mails.map(function (m) {
		return { date: m.date, amount: 1 };
	});
};

let analyseMails = async function (token) {
	try {
		let mails = await redis.retrieveData(token, "raw.google", "mail")

		let received = {
			number: mails.received.length,
			distribution: getDistribution(mails.received)
		};
		let sent = {
			number: mails.sent.length,
			distribution: getDistribution(mails.sent)
		};

		await redis.storeJson(token, "toDisplay.mails", "data", { received: received, sent: sent })
		utils.stopProcessing(token, "toDisplay.mails", "google", "mail")

		broker.publish("toDisplay/mails", JSON.stringify({ token: token }))
	} catch (err) {
		console.log(err)
	}
};

broker.listenTo("raw/google/mail", analyseMails)
