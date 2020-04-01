const redis = require("redis");
const client = redis.createClient();
const store = require("../../config/store.json");
const config = require("../../config/config.json");

const { setData, setTTL, getData, exists } = require("./utils");

let createNewUser = async function(token) {
  await setData(client, token, "", store);
  return setTTL(client, token, config.redisTTL);
};

let userExists = function(token) {
  return exists(client, token);
};

let storeJson = function(token, path, key, value) {
  path = trimPoint(path);
  key = trimPoint(key);
  let p = trimPoint(`${path}.${key}`);
  return setData(client, token, p, value);
};

let addDataToStore = function(token, path, key, value) {
  path = trimPoint(path);
  key = trimPoint(key);
  let p = trimPoint(`${path}.${key}`);

  promises = [];
  for (let v in value) {
    promises.push(setData(client, token, `${p}.${v}`, value[v]));
  }
  return Promise.all(promises);
};

let retrieveData = function(token, path, key) {
  path = trimPoint(path);
  key = trimPoint(key);
  let p = trimPoint(`${path}.${key}`);
  return getData(client, token, p);
};

let trimPoint = function(str) {
  str = str.replace(/^\./, "");
  str = str.replace(/\.$/, "");
  return str;
};

module.exports = {
  createNewUser,
  userExists,
  storeJson,
  addDataToStore,
  retrieveData
};
