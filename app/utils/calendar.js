exports.filterCalendar = (events) => {
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
