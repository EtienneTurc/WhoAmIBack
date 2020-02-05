const { google } = require('googleapis');
const { oauth2Client } = require('../google')

const { filterMails } = require('../../utils/gmail')
const { saveJson } = require('../../utils/utils')

const gmail = google.gmail({
	version: 'v1',
	auth: oauth2Client
});

async function allMails(labelIds) {
	var res = await gmail.users.messages.list({
		'userId': "me",
		labelIds: labelIds,
	});
	mails = res.data.resultSizeEstimate ? res.data.messages : []
	while (res.nextPageToken) {
		res = await gmail.users.messages.list({
			'userId': "me",
			labelIds: labelIds,
			nextPageToken: res.nextPageToken
		});
		mails.concat(res.data.resultSizeEstimate ? res.data.messages : [])
	}
	return mails
}

function getMailContent(mails) {
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
	var mails_received = await allMails(["INBOX"])
	var mails_sent = await allMails(["SENT"])

	var res = await Promise.all([Promise.all(getMailContent(mails_received)), Promise.all(getMailContent(mails_sent))])

	res[0].forEach(r => r.status = "received")
	res[1].forEach(r => r.status = "sent")
	mails = [filterMails(res[0]), filterMails(res[1])]
	saveJson("gmail.txt", mails[0].concat(mails[1]))
	return mails
}
