const { google } = require('googleapis');
const { oauth2Client } = require('../google')

const { filterMails } = require('../../utils/gmail')
const { saveJson } = require('../../utils/utils')

const gmail = google.gmail({
	version: 'v1',
	auth: oauth2Client
});

exports.getMails = async function () {
	try {
		var messages_received = await gmail.users.messages.list({
			'userId': "me",
			labelIds: ["INBOX"],
			q: "category:primary",
		});
		var messages_sent = await gmail.users.messages.list({
			'userId': "me",
			labelIds: ["SENT"],
		});

		let promises_received = []
		console.log(messages_received)
		for (let m of messages_received.data.messages) {
			promises_received.push(gmail.users.messages.get({
				'userId': "me",
				'id': m.id,
				'format': "full",
			}))
		}
		let promises_sent = []
		for (let m of messages_sent.data.messages) {
			promises_sent.push(gmail.users.messages.get({
				'userId': "me",
				'id': m.id,
				'format': "full",
			}))
		}
		var res = await Promise.all([Promise.all(promises_received), Promise.all(promises_sent)])
		res[0].forEach(r => r.status = "received")
		res[1].forEach(r => r.status = "sent")
		// saveJson("gmail.txt", filtered)
		return [filterMails(res[0]), filterMails(res[1])]
	} catch (error) {
		console.log(error)
	}
}
