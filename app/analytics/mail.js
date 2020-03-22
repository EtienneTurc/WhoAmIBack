const redis = require("../redis/redis")
const { broker } = require("../utils/broker")

let getDistribution = mails => {
	return mails.map(function (m) {
		return { date: m.date, amount: 1 };
	});
};

let analyseMails = async function (token) {
	let mails = await redis.retrieveData(token, "raw.google", "mail")

	let received = {
		number: mails.received.length,
		distribution: getDistribution(mails.received)
	};
	let sent = {
		number: mails.sent.length,
		distribution: getDistribution(mails.sent)
	};

	await redis.storeData(token, "toDisplay.mails", "data", { received: received, sent: sent })
	broker.publish("toDisplay/mails", JSON.stringify({ token: token }))
};

broker.listenTo("raw/google/mail", analyseMails)
