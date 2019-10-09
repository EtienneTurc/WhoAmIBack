const { google } = require('googleapis');
const config = require('../../config/config')

const oauth2Client = new google.auth.OAuth2(
	config.clientID,
	config.clientSecret,
	config.redirect_url
);

// generate a url that asks permissions the given scopes
function getConsentUrl() {
	return oauth2Client.generateAuthUrl({
		// 'online' (default) or 'offline' (gets refresh_token)
		access_type: 'offline',

		// If you only need one scope you can pass it as a string
		scope: config.scopes
	});
}

// Set the tokens
async function setToken(code) {
	const { tokens } = await oauth2Client.getToken(code)
	oauth2Client.setCredentials(tokens);
}

module.exports = { oauth2Client, getConsentUrl, setToken }
