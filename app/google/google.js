const { google } = require('googleapis');
const config = require('../../config/config')

const oauth2Client = new google.auth.OAuth2(
	config.clientID,
	config.clientSecret,
	config.redirect_url
);

const calendar = google.calendar({
	version: 'v3',
	auth: oauth2Client
});

// generate a url that asks permissions for Blogger and Google Calendar scopes
const scopes = [
	// 	'https://www.googleapis.com/auth/blogger',
	'https://www.googleapis.com/auth/calendar'
];

exports.getConsentUrl = function () {
	return oauth2Client.generateAuthUrl({
		// 'online' (default) or 'offline' (gets refresh_token)
		access_type: 'offline',

		// If you only need one scope you can pass it as a string
		scope: scopes
	});
}

exports.setToken = async function (code) {
	const { tokens } = await oauth2Client.getToken(code)
	oauth2Client.setCredentials(tokens);
}

exports.getCalendarList = async function () {
	const res = await calendar.calendarList.list({
		Authorization: oauth2Client.access_token
	});
	console.log(res.data);
}
