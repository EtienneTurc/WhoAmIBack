const router = require("express").Router();
const utils = require("../utils/utils");

const calendar = require("../google/services/calendar");
const drive = require("../google/services/drive");
const people = require("../google/services/people");
const gmail = require("../google/services/gmail");

router.get("/people", async (req, res) => {
  let peopleInfo = await people.getPeopleInformation();
  res.send(peopleInfo);
});

router.get("/calendar", async (req, res) => {
  let events = await calendar.getCalendarEvents();
  res.send(events);
});

router.get("/drive", async (req, res) => {
  let filesLinks = await drive.getDriveFiles();
  res.send(filesLinks);
});

var global_simple_mails_info = {};
router.get("/analytics/gmail", async (req, res) => {
  let messages = await gmail.getMails(
    req.session.token,
    global_simple_mails_info
  );
  res.send(messages);
});

router.get("/basic/gmail", async (req, res) => {
  await utils.waitDefined(
    global_simple_mails_info,
    req.session.token.access_token
  );
  res.send(global_simple_mails_info[req.session.token.access_token]);
  delete global_simple_mails_info[req.session.token.access_token];
});

router.get("/", async (req, res) => {
  let promises = [];
  promises.push(people.getPeopleInformation());
  promises.push(calendar.getCalendarEvents());
  promises.push(gmail.getMails(req.session.token, global_simple_mails_info));
  console.log("GETTING THE DATA");

  let result = await Promise.all(promises);
  console.log("DONE");
  res.send({ people: result[0], calendar: result[1], gmail: result[2] });
});

module.exports = router;
