const { google } = require('googleapis');
const { oauth2Client } = require('../google')

const people = google.people({
	version: 'v1',
	auth: oauth2Client
});

const information = ["addresses",
	"emailAddresses",
	"names",
	"birthdays"
]

let filterPeople = people => {
	let filtered = {}
	// First and last Name
	if (people.names && people.names.length) {
		let n = people.names[0]
		filtered.lastName = n.familyName
		filtered.firstName = n.givenName
	}

	// Birthday
	if (people.birthdays) {
		for (let b of people.birthdays) {
			if (b.type == "ACCOUNT" && b.date) {
				filtered.birthDate = b.date
			}
		}
		if (people.birthdays.length && !filtered.birthDate) {
			filtered.birthDate = people.birthdays[0].date
		}
	}

	if (people.emailAddresses)
		filtered.mails = people.emailAddresses.map((m) => m.value)
	if (people.addresses)
		filtered.addresses = people.addresses.map((a) => a.formattedValue)

	// Remove duplicates
	filtered.mails = [...new Set(filtered.mails)]
	filtered.addresses = [...new Set(filtered.addresses)]

	return filtered
}

exports.getPeopleInformation = async function () {
	const res = await people.people.get({
		Authorization: oauth2Client.access_token,
		personFields: information,
		resourceName: "people/me"
	})
	return filterPeople(res.data)
}
