const axios = require('axios')

exports.basicInfo = async function (token) {
	console.log("HELLO")
	try {
		let me = await axios.get("https://graph.facebook.com/v6.0/me/", {
			params: {
				fields: 'first_name,picture.type(large),hometown,location',
				access_token: token
			}
		})
		console.log(me.data)
		return me
	}
	catch (err) {
		console.log(err)
	}
}
