const axios = require("axios")
const htmlToText = require("html-to-text");
const unidecode = require("unidecode")

const config = require("../../../config/config");
const redis = require("../../redis/redis")
const utils = require("../../utils/utils");
const { broker } = require("../../utils/broker")


let decodeBase64 = content => {
	let buf = Buffer.from(content, "base64"); // Ta-da
	return buf.toString();
};

let cleanBody = str => {
	return unidecode(str
		.split(/https?[^\s]+/g)
		.join("")
		.split("\r")
		.join(" ")
		.split(/ +/g)
		.join(" "))
};

let parseHtml = function (text) {
	return htmlToText.fromString(text, {
		wordwrap: null,
		ignoreHref: true,
		ignoreImage: true,
		longWordSplit: {
			forceWrapOnLimit: false
		}
	});
};

let getPartsData = function (parts) {
	let data = ""
	for (let p of parts) {
		if (p.mimeType == "multipart/alternative" || p.mimeType == "multipart/related") {
			data = data.concat(' ', getPartsData(p.parts))
		} else if (p.mimeType == "text/plain") {
			data = data.concat(' ', cleanBody(decodeBase64(p.body.data || "")))
		} else if (p.mimeType == "text/html") {
			data = data.concat(' ', cleanBody(parseHtml(decodeBase64(p.body.data || ""))))
		}
	}
	return data
}

let filterMails = mails => {
	let filtered = [];
	let headers = ["From", "To", "Subject"];

	mails.forEach(e => {
		let part =
			e.body.payload && e.body.payload.parts ? getPartsData(e.body.payload.parts) : "";
		if (!e.body.payload) {
		} else {
			filtered.push({
				snippet: cleanBody(e.body.snippet),
				status: e.status,
				date: e.body.internalDate,
				headers: e.body.payload.headers.filter(h => headers.includes(h.name)).map(el => JSON.parse(unidecode(JSON.stringify(el)))),
				body: cleanBody(parseHtml(decodeBase64(e.body.payload.body.data || ""))) + " " + part
			});
		}
	});
	return filtered;
};

let getMailContent = (batch, mails) => {
	return new Promise(function (resolve, reject) {
		for (let m of mails) {
			batch.add({
				method: "GET",
				path: "/gmail/v1/users/me/messages/" + m.id + "?format=full"
			});
		}
		batch.run((err, res) => {
			if (err) reject(err);
			resolve(res ? res.parts : []);
		});
	});
};

let allMails = async (labelIds, token, steps) => {
	if (!steps) {
		return []
	}
	let mails_promises = [];
	let res;
	let i = 0;
	while (i == 0 || (res.data.nextPageToken && (i < steps || steps == -1))) {
		let queries = "labelIds=" + labelIds;

		if (i != 0) {
			queries += "&pageToken=" + res.data.nextPageToken;
		}
		res = await axios.get("https://www.googleapis.com/gmail/v1/users/me/messages?" + queries, { headers: { Authorization: "Bearer " + token } })
		if (res.data.resultSizeEstimate) {
			let batch = utils.createBatch(
				"https://www.googleapis.com/batch",
				"POST",
				token
			);
			mails_promises.push(getMailContent(batch, res.data.messages));
		}

		i++;
	}

	let mails = await Promise.all(mails_promises);
	mails = [].concat.apply([], mails);
	return mails;
};

let getAndStoreMails = async function (token) {
	try {
		let googleToken = await redis.retrieveData(token, "tokens", "google")

		var mailsReceived = await allMails("INBOX", googleToken, Math.ceil(config.numberMails.received / 100)); // last variable = number of mails to get * 100
		var mailsSent = await allMails("SENT", googleToken, Math.ceil(config.numberMails.sent / 100));


		let mails = { received: filterMails(mailsReceived), sent: filterMails(mailsSent) }

		await redis.storeJson(token, "raw.google", "mail", mails)

		broker.publish("raw/google/mail", JSON.stringify({ token: token }))
	} catch (error) {
		console.log(error)
	}
};

broker.listenTo("start/google/mail", getAndStoreMails)
