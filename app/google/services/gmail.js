const { google } = require('googleapis');
const config = require("../../../config/config")
const { oauth2Client } = require('../google')
const axios = require('axios')
const utils = require('../../utils/utils')

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
		return { "date": m.date, "amount": 1 }
	})
}

let filterMails = mails => {
	let filtered = [];
	let headers = ["From", "To", "Subject"];
	mails.forEach(e => {
		let part =
			e.body.payload && e.body.payload.parts
				? e.body.payload.parts
					.filter(p => p.mimeType == "text/plain")
					.map(p => cleanBody(decodeBase64(p.body.data || "")))
					.join(" ")
				: "";
		filtered.push({
			snippet: e.body.snippet,
			status: e.status,
			date: e.body.internalDate,
			headers: e.body.payload.headers.filter(h => headers.includes(h.name)),
			body:
				cleanBody(
					htmlToText.fromString(decodeBase64(e.body.payload.body.data || ""), {
						wordwrap: null,
						ignoreHref: true,
						ignoreImage: true,
						longWordSplit: {
							forceWrapOnLimit: false
						}
					})
				) +
				" " +
				part
		});
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
			resolve(res.parts);
		});
	});
};

let allMails = async (labelIds, token, steps) => {
	let mails_promises = []
	let res
	let i = 0
	while (i == 0 || res.data.nextPageToken && (i < steps || steps == -1)) {
		let queries = {
			'userId': "me",
			labelIds: labelIds,
		}

		if (i != 0) {
			queries.pageToken = res.data.nextPageToken
		}

		res = await gmail.users.messages.list(queries);
		if (res.data.resultSizeEstimate) {
			let batch = utils.createBatch('https://www.googleapis.com/batch/gmail/v1', "POST", token)
			mails_promises.push(getMailContent(batch, res.data.messages))
		}

		i++
	}

	let mails = await Promise.all(mails_promises)
	mails = [].concat.apply([], mails);
	return mails
}

exports.getMails = async function (token, global_simple_mails_info) {
	var mailsReceived = await allMails(["INBOX"], token, 1)
	var mailsSent = await allMails(["SENT"], token, 1)

	mails = [filterMails(mailsReceived), filterMails(mailsSent)]

	let received = { number: mails[0].length, distribution: getDistribution(mails[0]) }
	let sent = { number: mails[1].length, distribution: getDistribution(mails[1]) }

	global_simple_mails_info[token.access_token] = { received: received, sent: sent }
	// utils.saveJson("gmail.txt", mails[0].concat(mails[1]))

	let res = await axios.post(config.flaskUrl + "/analytics/mail", { received: mails[0], sent: mails[1] })

	console.log(res.data)
	return res.data
}
