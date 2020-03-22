const config = require("../../config/config")
const redis = require("../redis/redis")
const jwt = require('jsonwebtoken');

let getJwtToken = function (mail) {
	return jwt.sign({
		data: mail
	}, config.jwtSecret);
}

let checkLogin = async function (req, res, next) {
	let userExists = redis.checkIfUserExists(req.session.token)
	if (!req.session.token || !userExists) {
		res.sendStatus(401)
	} else {
		next()
	}
}

module.exports = { getJwtToken, checkLogin }
