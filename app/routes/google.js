const router = require("express").Router();
const utils = require("../utils/utils");

const calendar = require("../google/services/calendar");
const drive = require("../google/services/drive");
const people = require("../google/services/people");
const gmail = require("../google/services/gmail");

router.get("/basic/people", async (req, res) => {
  let peopleInfo = await people.getPeopleInformation();
  res.send(peopleInfo);
});

router.get("/calendar", async (req, res) => {
  let events = await calendar.getCalendarEvents(
    req.session.google.access_token
  );
  res.send(events);
});

router.get("/drive", async (req, res) => {
  console.log("GETTING THE DATA FROM DRIVE");
  let filesLinks = await drive.getDriveFiles(req.session.google.access_token);
  console.log("DONE");
  res.send(filesLinks);
});

const config = require("../../config/config");
const axios = require("axios");

router.get("/words", async (req, res) => {
  console.log("GETTING WORDS");
  let words = await axios.get(config.flaskUrl + "/analytics/words");
  if (!words) {
    res.send(words.data);
  }
  res.send(words.data);
});

var global_simple_mails_info = {};
router.get("/analytics/gmail", async (req, res) => {
  console.log("GETTING THE DATA FROM GMAIL");
  let messages = await gmail.getMails(
    req.session.google.access_token,
    global_simple_mails_info
  );
  console.log("DONE BASIC");
  res.send(messages);
});

router.get("/basic/gmail", async (req, res) => {
  console.log("GETTING THE DATA FROM GMAIL BASIC");
  await utils.waitDefined(
    global_simple_mails_info,
    req.session.google.access_token
  );
  console.log(global_simple_mails_info);

  console.log("DONE ANALYTIC");
  res.send(global_simple_mails_info[req.session.google.access_token]);
  delete global_simple_mails_info[req.session.google.access_token];
});

router.get("/", async (req, res) => {
  let promises = [];
  promises.push(people.getPeopleInformation());
  promises.push(calendar.getCalendarEvents());
  promises.push(
    gmail.getMails(req.session.google.access_token, global_simple_mails_info)
  );
  console.log("GETTING THE DATA");

  let result = await Promise.all(promises);
  console.log("DONE");
  res.send({ people: result[0], calendar: result[1], gmail: result[2] });
});

module.exports = router;
