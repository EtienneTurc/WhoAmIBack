const moment = require('moment')

const { google } = require('googleapis');
const { oauth2Client } = require('../google')

const gmail = google.gmail({
	version: 'v1',
	auth: oauth2Client
});

const htmlToText = require('html-to-text');

let decodeBase64 = (content) => {
	let buf = Buffer.from(content, 'base64'); // Ta-da
	return buf.toString()
}

let cleanBody = str => {
	// 	return str.split(/https?[^\s]+/g).join("").split("\r").join(" ").split("\n").join(" ").split(/[.,?\/#!$%\^&\*;:{}=\-_`~()]/g).join("").normalize("NFD").split(/[\u0300-\u036f]/g).join("").split(/ +/g).join(" ")
	// }
	return str.split(/https?[^\s]+/g).join("").split("\r").join(" ").split("\n").join(" ").split(/ +/g).join(" ")
}

let filterMails = mails => {
	let filtered = []
	let headers = ['From', 'To', 'Subject']
	mails.forEach(e => {
		let part = e.data.payload.parts ? e.data.payload.parts.filter(p => p.mimeType == 'text/plain').map(p => cleanBody(decodeBase64(p.body.data || ""))).join(" ") : ""
		filtered.push({
			"snippet": e.data.snippet,
			"status": e.status,
			"date": e.data.internalDate,
			"headers": e.data.payload.headers.filter(h => headers.includes(h.name)),
			"body": cleanBody(htmlToText.fromString(decodeBase64(e.data.payload.body.data || ""), {
				wordwrap: null,
				ignoreHref: true,
				ignoreImage: true,
				longWordSplit: {
					forceWrapOnLimit: false
				}
			})) + " " + part,
		})
	})
	return filtered
}

let getDistribution = mails => {
	let millisecondsInDay = 1000 * 3600 * 24
	let dates = mails.map(m => Math.floor(m.date / millisecondsInDay) * millisecondsInDay)
	dates.sort()

	let distribution = [1]
	let startDate = dates[0]
	let lastDate = dates[0]

	for (let d of dates) {
		if (d == lastDate) {
			distribution[distribution.length - 1] += 1
		} else {
			distribution = distribution.concat(new Array((d - lastDate) / millisecondsInDay).fill(0))
			distribution[distribution.length - 1] += 1
			lastDate = d
		}
	}
	return { startDate: startDate, distribution: distribution }
}

let allMails = async (labelIds, steps) => {
	var res = await gmail.users.messages.list({
		'userId': "me",
		labelIds: labelIds,
	});
	let messages = res.data.resultSizeEstimate ? res.data.messages : []
	let mails = await Promise.all(getMailContent(messages))
	i = 0
	while (res.data.nextPageToken && (i < steps || steps == -1)) {
		i++
		res = await gmail.users.messages.list({
			'userId': "me",
			labelIds: labelIds,
			pageToken: res.data.nextPageToken
		});
		if (res.data.resultSizeEstimate) {
			mails = mails.concat(await Promise.all(getMailContent(res.data.messages)))
		}
	}
	return mails
}

let getMailContent = mails => {
	let promises = []
	for (let m of mails) {
		promises.push(gmail.users.messages.get({
			'userId': "me",
			'id': m.id,
			'format': "full",
		}))
	}
	return promises
}

exports.getMails = async function () {
	var mailsReceived = await allMails(["INBOX"], 1)
	var mailsSent = await allMails(["SENT"], 1)

	mails = [filterMails(mailsReceived), filterMails(mailsSent)]

	let distributions = [getDistribution(mails[0]), getDistribution(mails[1])]

	let received = { number: mails[0].length, ...distributions[0] }
	let sent = { number: mails[1].length, ...distributions[1] }

	// saveJson("gmail.txt", mails[0].concat(mails[1]))
	return { received: received, sent: sent }
}
