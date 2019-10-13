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
		access_type: 'online',

		// If you only need one scope you can pass it as a string
		scope: config.scopes
	});
}

// Set the token
async function setToken(req, res, next) {
	try {
		if (!req.headers.token && req.headers.code) {
			const { tokens } = await oauth2Client.getToken(req.headers.code)
			oauth2Client.setCredentials(tokens);
			res.locals.token = tokens
		} else {
			oauth2Client.setCredentials(JSON.parse(req.headers.token));
		}
		next()
	} catch (err) {
		console.log(err)
		res.send(err)
	}
}

module.exports = { oauth2Client, getConsentUrl, setToken }
