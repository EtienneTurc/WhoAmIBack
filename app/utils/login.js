const config = require("../../config/config")
const redis = require("../redis/redis")
const jwt = require('jsonwebtoken');

let getJwtToken = function (mail) {
	return jwt.sign({
		data: mail
	}, config.jwtSecret);
}

let checkLogin = async function (req, res, next) {
	if (!req.session.token || !(await redis.userExists(req.session.token))) {
		res.sendStatus(401)
	} else {
		next()
	}
}

module.exports = { getJwtToken, checkLogin }
