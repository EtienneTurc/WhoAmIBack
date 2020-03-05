const { google } = require('googleapis');
const { oauth2Client } = require('../google')
const utils = require('../../utils/utils')

const drive = google.drive({
	version: 'v3',
	auth: oauth2Client
});

let getDriveContent = async function (file_id) {
	return drive.files.get({
		Authorization: oauth2Client.access_token,
		fileId: file_id,
		fields: ["exportLinks", "webContentLink"]
	})
	// for (let index = 0; index < Math.min(driveFiles.length, 10); index++) {
	// 	f = driveFiles[index]

	// }
	// filesLinks = await Promise.all(filesLinksPromises)
}

let getFileType = function (file) {
	if (file.mimeType == "application/vnd.google-apps.folder") {
		return "folder"
	}
	let type = file.mimeType.split(/\/|\./) // split on / or .
	let n = type.length
	if (type[n - 1] == 'pdf') {
		return "pdf"
	} else if (type[n - 1].includes("sheet")) {
		return "csv"
	} else if (type[n - 1].includes("doc")) {
		return "doc"
	} else {
		return "other"
	}
}

let getDriveList = async function (token, parentId = null) {
	let res
	let i = 0
	let driveList = []
	while (i == 0 || res.data.nextPageToken) {
		let queries = {
			pageSize: 1000,
			fields: "files(id, name, mimeType, parents)",
		}

		if (parentId) {
			queries.q = `'${parentId}' in parents`
		}

		if (i != 0) {
			queries.pageToken = res.data.nextPageToken
		}

		res = await drive.files.list(queries)
		driveList = driveList.concat(res.data.files)
		i++
	}
	return driveList
}

let getTreeRepresentation = async function (fileId, token, depth, current_depth = 0) {
	let tree = []
	if (current_depth > depth) {
		return null
	}
	let files = await getDriveList(token, fileId)
	for (let file of files) {
		let type = getFileType(file)
		let f = { ...file, type: type }
		if (type == "folder") {
			f.files = await getTreeRepresentation(f.id, token, depth, current_depth + 1)
		}
		tree.push(f)
	}
	return tree
}

exports.getDriveFiles = async function (token) {
	let tree = await getTreeRepresentation('root', token, 1)
	// let files = { doc: [], pdf: [], csv: [], other: [] }
	// driveList.forEach(f => {
	// 	let type = getFileType(f)
	// 	files[type].push(f)
	// });

	// for (let key in files) {
	// 	console.log(key, files[key].length)
	// }

	// utils.saveJson("drive.txt", files)

	return tree
}
