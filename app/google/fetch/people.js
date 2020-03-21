const { google } = require('googleapis');
const { oauth2Client } = require('../google')
const { broker } = require("../../utils/broker")

const redis = require('../../redis/redis')

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
	filtered.firstName = ""
	filtered.lastName = ""
	if (people.names && people.names.length) {
		let n = people.names[0]
		filtered.lastName = n.familyName
		filtered.firstName = n.givenName
	}

	// Birthday
	if (people.birthdays) {
		for (let b of people.birthdays) {
			if (b.metadata.source.type == "ACCOUNT" && b.date) {
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

let getAndStorePeople = async function (token) {
	let googleToken = await redis.retrieveData(token, "tokens", "google")
	const res = await people.people.get({
		Authorization: googleToken,
		personFields: information,
		resourceName: "people/me"
	})

	let filter = filterPeople(res.data)
	await redis.storeData(token, "raw.google", "people", filter)

	broker.publish("raw/google/people", 'done')
}

broker.listenTo("start/google/people", getAndStorePeople)
