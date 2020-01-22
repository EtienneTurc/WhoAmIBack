const { google } = require('googleapis');
const config = require('../../config/config')

const oauth2Client = new google.auth.OAuth2(
	config.clientID,
	config.clientSecret,
	config.redirectUrl
);

// generate a url that asks permissions the given scopes
function getConsentUrl() {
	return oauth2Client.generateAuthUrl({
		// 'online' (default) or 'offline' (gets refresh_token)
		access_type: 'online',

		// If you only need one scope you can pass it as a string
		scope: config.scopes
	});
}


// Set the token
async function setToken(req, res, next) {
	try {

		if (!req.session.token) {
			res.sendStatus(401) // Unauthorized
		} else {
			oauth2Client.setCredentials(req.session.token);
		}
		next()
	} catch (err) {
		console.log(err)
		res.send(err)
	}
}

module.exports = { oauth2Client, getConsentUrl, setToken }
