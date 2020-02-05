const htmlToText = require('html-to-text');

let decodeBase64 = (content) => {
	let buf = Buffer.from(content, 'base64'); // Ta-da
	return buf.toString()
}

let cleanBody = str => {
	return str.split(/https?[^\s]+/g).join("").split("\r").join(" ").split("\n").join(" ").split(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g).join("").normalize("NFD").split(/[\u0300-\u036f]/g).join("").split(/  +/g).join(" ").toLowerCase()
}

exports.filterMails = (mails) => {
	let filtered = []
	let headers = ['From', 'To', 'Subject']
	mails.forEach(e => {
		let part = e.data.payload.parts ? e.data.payload.parts.filter(p => p.mimeType == 'text/plain').map(p => cleanBody(decodeBase64(p.body.data || ""))).join(" ") : ""
		filtered.push({
			"snippet": e.data.snippet,
			"status": e.status,
			"date": e.data.internalDate,
			"headers": e.data.payload.headers.filter(h => headers.includes(h.name)),
			"body": cleanBody(htmlToText.fromString(decodeBase64(e.data.payload.body.data || ""), {
				wordwrap: null,
				ignoreHref: true,
				ignoreImage: true,
				longWordSplit: {
					forceWrapOnLimit: false
				}
			})) + " " + part,
		})
	})
	return filtered
}
