const router = require("express").Router();

const facebook = require("../facebook/facebook")

router.get("/basic", async (req, res) => {
	console.log("FACEBOOK BASIC INFO")
	let info = await facebook.basicInfo(req.session.facebook.access_token);
	console.log("DONE")
	res.send(info);
});

router.get("/basic/feed", async (req, res) => {
	console.log("FACEBOOK BASIC INFO")
	let info = await facebook.basicFeed(req.session.facebook.access_token);
	console.log("DONE")
	res.send(info);
});

module.exports = router;
