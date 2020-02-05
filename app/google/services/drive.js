const { google } = require('googleapis');
const { oauth2Client } = require('../google')

const drive = google.drive({
	version: 'v3',
	auth: oauth2Client
});

exports.getDriveFiles = async function () {
	try {
		const res = await drive.files.list({
			Authorization: oauth2Client.access_token
		});

		let driveFiles = res.data.files
		let filesLinksPromises = []
		// console.log(driveFiles)
		for (let index = 0; index < Math.min(driveFiles.length, 10); index++) {
			f = driveFiles[index]
			filesLinksPromises.push(drive.files.get({
				Authorization: oauth2Client.access_token,
				fileId: f.id,
				fields: ["exportLinks", "webContentLink"]
			}))
		}
		filesLinks = await Promise.all(filesLinksPromises)
		console.log(filesLinks)
		return filesLinks
	} catch (error) {
		console.log(error)
	}
}
