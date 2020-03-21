const config = require("../../config/config")
var jwt = require('jsonwebtoken');

let getJwtToken = function (mail) {
	jwt.sign({
		data: mail
	}, config.jwtSecret);
}

module.exports = { getJwtToken }
