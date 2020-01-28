const { google } = require('googleapis');
const { oauth2Client } = require('../google')

const { filterMails } = require('../../utils/gmail')

const gmail = google.gmail({
	version: 'v1',
	auth: oauth2Client
});

exports.getMails = async function () {
	try {
		var messages = await gmail.users.messages.list({
			'userId': "etienne.turc@gmail.com",
		});
		let promises = []
		// console.log(messages)
		for (let m of messages.data.messages) {
			promises.push(gmail.users.messages.get({
				'userId': "etienne.turc@gmail.com",
				'id': m.id,
				'format': "full",
			}))
		}
		var content = await Promise.all(promises)
		let filtered = filterMails(content)
		for (let p of filtered[0].parts) {
			console.log(p)
		}
		// console.log(content[0].data.payload.parts[1].parts[0])
		return content
	} catch (error) {
		console.log(error)
	}
}
