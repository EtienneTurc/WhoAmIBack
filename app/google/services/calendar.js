const { google } = require('googleapis');
const { oauth2Client } = require('../google')

const calendar = google.calendar({
	version: 'v3',
	auth: oauth2Client
});

exports.getCalendarEvents = async function () {
	try {
		const res = await calendar.calendarList.list({
			Authorization: oauth2Client.access_token
		});

		let calendarList = res.data.items
		let eventsPromises = []
		for (let cal of calendarList) {
			eventsPromises.push(calendar.events.list({
				Authorization: oauth2Client.access_token,
				calendarId: cal.id
			}))
		}
		let events = await Promise.all(eventsPromises)
		return events
	} catch (error) {
		console.log(error)
	}
}
