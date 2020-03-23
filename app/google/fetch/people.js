const axios = require('axios')

const { broker } = require("../../utils/broker")
const redis = require('../../redis/redis')

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
	try {
		let googleToken = await redis.retrieveData(token, "tokens", "google")

		const res = await axios.get("https://people.googleapis.com/v1/people/me", { headers: { Authorization: "Bearer " + googleToken }, params: { personFields: information.join(",") } })

		let filter = filterPeople(res.data)
		await redis.storeData(token, "raw.google", "people", filter)
		broker.publish("raw/google/people", JSON.stringify({ token: token }))
	} catch (err) {
		console.log(err)
	}
}

broker.listenTo("start/google/people", getAndStorePeople)
