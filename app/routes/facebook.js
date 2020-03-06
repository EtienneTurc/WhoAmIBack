const router = require("express").Router();
const utils = require("../utils/utils");

const facebook = require("../facebook/facebook")

router.get("/basic/info", async (req, res) => {
	console.log("FACEBOOK BASIC INFO")
	let info = await facebook.basicInfo(req.session.facebook.access_token);
	console.log("DONE")
	res.send(info);
});

module.exports = router;
