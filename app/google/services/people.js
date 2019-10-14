const { google } = require('googleapis');
const { oauth2Client } = require('../google')

const people = google.people({
	version: 'v1',
	auth: oauth2Client
});

const information = ["addresses",
	"ageRanges",
	"birthdays",
	"coverPhotos",
	"emailAddresses",
	"genders",
	"names",
	"nicknames",
	"phoneNumbers",
	"photos",
]

exports.getPeopleInformation = async function () {
	try {
		const res = await people.people.get({
			Authorization: oauth2Client.access_token,
			personFields: information,
			resourceName: "people/me"
		});

		console.log(res)
		return res
	} catch (error) {
		console.log(error)
	}
}
