const { google } = require('googleapis');
const { oauth2Client } = require('../google')

const calendar = google.calendar({
	version: 'v3',
	auth: oauth2Client
});

let filterCalendar = events => {
	let events_reduced = events.reduce((acc, e) => acc.concat(e.data.items), [])
	let filtered = []
	events_reduced.forEach(e => {
		filtered.push({
			"summary": e.summary,
			"description": e.description,
			"location": e.location,
			"startTime": e.start ? e.start.dateTime : '',
			"endTime": e.end ? e.end.dateTime : '',
			"attachements": e.attachements ? e.attachements.map(el => el.title) : []
		})
	})
	return filtered
}

let getLocations = events => {
	let locations = []
	let d = {}

	events.forEach(e => {
		if (!e.location) {
			return
		}

		if (d[e.location]) {
			d[e.location]++
		} else {
			d[e.location] = 1
		}
	})
	for (let loc of Object.keys(d)) {
		locations.push({ name: loc, frequency: d[loc] })
	}

	return locations
}



exports.getCalendarEvents = async function () {
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

	events = filterCalendar(events)
	let locations = getLocations(events)

	return { number: events.length, locations: locations }
}
