let decodeBase64 = (content) => {
	let buf = Buffer.from(content, 'base64'); // Ta-da
	return buf.toString()
}
exports.filterMails = (mails) => {
	let filtered = []
	let headers = ['From', 'To', 'Subject']
	mails.forEach(e => {
		filtered.push({
			"snippet": e.data.snippet,
			"date": e.data.internalDate,
			"headers": e.data.payload.headers.filter(h => headers.includes(h.name)),
			"body": decodeBase64(e.data.payload.body.data || ""),
			"parts": e.data.payload.parts ? e.data.payload.parts.map(p => decodeBase64(p.body.data || "")) : [],
		})
	})
	return filtered
}
