const fs = require('fs');


let filterCalendar = (events) => {

	let filtered = []
	console.log(events.length)
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

exports.saveCalendar = async (file_name, events) => {
	let filtered = filterCalendar(events)
	console.log(filtered)
	await fs.writeFile(file_name, JSON.stringify(filtered), function (err) {

		if (err) {
			console.log(err);
		}

		console.log("The file was saved!");
	});
}
