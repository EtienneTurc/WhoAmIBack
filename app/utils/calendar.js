const fs = require('fs');

let filterCalendar = (events) => {
	let filtered = []
	events.forEach(e => {
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

exports.saveCalendar = async (fileName, events) => {
	let filtered = filterCalendar(events)
	await fs.writeFile(fileName, JSON.stringify(filtered), function (err) {
		if (err) {
			console.log(err);
		}
		console.log("The file was saved!");
	});
}
