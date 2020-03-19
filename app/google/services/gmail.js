const { google } = require("googleapis");
const { oauth2Client } = require("../google");
const config = require("../../../config/config");
const redis = require("../../redis/redis")
const axios = require("axios");
const utils = require("../../utils/utils");


const gmail = google.gmail({
	version: "v1",
	auth: oauth2Client
});

const htmlToText = require("html-to-text");

let decodeBase64 = content => {
	let buf = Buffer.from(content, "base64"); // Ta-da
	return buf.toString();
};

let cleanBody = str => {
	// 	return str.split(/https?[^\s]+/g).join("").split("\r").join(" ").split("\n").join(" ").split(/[.,?\/#!$%\^&\*;:{}=\-_`~()]/g).join("").normalize("NFD").split(/[\u0300-\u036f]/g).join("").split(/ +/g).join(" ")
	// }
	return str
		.split(/https?[^\s]+/g)
		.join("")
		.split("\r")
		.join(" ")
		.split(/ +/g)
		.join(" ");
};

let getDistribution = mails => {
	return mails.map(function (m) {
		return { date: m.date, amount: 1 };
	});
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
		// if (p.body && p.body.size == 112) {
		// 	console.log(p)
		// 	console.log(p)
		// 	console.log("DATA", data)
		// }
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
				snippet: e.body.snippet,
				status: e.status,
				date: e.body.internalDate,
				headers: e.body.payload.headers.filter(h => headers.includes(h.name)),
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
		let queries = {
			userId: "me",
			labelIds: labelIds
		};

		if (i != 0) {
			queries.pageToken = res.data.nextPageToken;
		}

		res = await gmail.users.messages.list(queries);
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

exports.getMails = async function (token, global_simple_mails_info) {
	redis.storeProcessing(token, "google", "mail")

	var mailsReceived = await allMails(["INBOX"], token, Math.ceil(config.numberMails.received / 100)); // last variable = number of mails to get * 100
	var mailsSent = await allMails(["SENT"], token, Math.ceil(config.numberMails.sent / 100));

	mails = [filterMails(mailsReceived), filterMails(mailsSent)];
	redis.storeData(token, "raw.google", "mail", { received: mails[0], sent: mails[1] })

	let received = {
		number: mails[0].length,
		distribution: getDistribution(mails[0])
	};
	let sent = {
		number: mails[1].length,
		distribution: getDistribution(mails[1])
	};

	global_simple_mails_info[token] = {
		received: received,
		sent: sent
	};
	// utils.saveJson("gmail.txt", mails[0].concat(mails[1]))

	let res = await axios.post(config.flaskUrl + "/analytics/mail", {
		received: mails[0],
		sent: mails[1],
		token: token
	});
	return res.data;
};
