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
			'userId': "etienne.turc@gmail.com",
			labelIds: ["INBOX"],
			q: "category:primary",
		});
		var messages_sent = await gmail.users.messages.list({
			'userId': "etienne.turc@gmail.com",
			labelIds: ["SENT"],
		});

		let promises_received = []
		for (let m of messages_received.data.messages) {
			promises_received.push(gmail.users.messages.get({
				'userId': "etienne.turc@gmail.com",
				'id': m.id,
				'format': "full",
			}))
		}
		let promises_sent = []
		for (let m of messages_sent.data.messages) {
			promises_sent.push(gmail.users.messages.get({
				'userId': "etienne.turc@gmail.com",
				'id': m.id,
				'format': "full",
			}))
		}
		var res = await Promise.all([Promise.all(promises_received), Promise.all(promises_sent)])
		res[0].forEach(r => r.status = "received")
		res[1].forEach(r => r.status = "sent")
		let filtered = filterMails(res[0].concat(res[1]))
		saveJson("gmail.txt", filtered)
		return filtered
	} catch (error) {
		console.log(error)
	}
}
