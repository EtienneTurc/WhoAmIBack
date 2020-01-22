const { google } = require('googleapis');
const { oauth2Client } = require('../google')

const gmail = google.gmail({
	version: 'v1',
	auth: oauth2Client
});

exports.getMails = async function () {
	try {
		var messages = await gmail.users.messages.list({
			'userId': "etienne.turc@gmail.com",
		});
		promises = []
		for (let m of messages.data.messages) {
			promises.push(gmail.users.messages.get({
				'userId': "etienne.turc@gmail.com",
				'id': m.id,
				'format': "full"
			}))
		}
		var content = await Promise.all(promises)
		// console.log(content)
		// for (let data of content) {
		// 	console.log("---------------------------------------------------------------------------")
		// 	console.log("---------------------------------------------------------------------------")
		// 	console.log("---------------------------------------------------------------------------")
		// 	console.log(data.data.payload)
		// }
		console.log(content[0].data.payload)
		console.log(content[0].data.payload.parts[1].parts[0])
		return content
	} catch (error) {
		console.log(error)
	}
}
