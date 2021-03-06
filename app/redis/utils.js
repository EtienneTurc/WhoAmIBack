const utf8 = require("utf8");

exports.setData = function(client, token, path, value) {
  return new Promise(function(resolve, reject) {
    client.send_command(
      "JSON.SET",
      [token, "." + path, JSON.stringify(value)],
      (err, res) => {
        if (err) reject(err);
        resolve();
      }
    );
  });
};

exports.setTTL = function(client, token, ttl) {
  return new Promise(function(resolve, reject) {
    client.send_command("EXPIRE", [token, ttl], (err, res) => {
      if (err) reject(err);
      resolve();
    });
  });
};

exports.getData = function(client, token, path) {
  return new Promise(function(resolve, reject) {
    client.send_command("JSON.GET", [token, "." + path], (err, res) => {
      if (err) reject(err);

      let response = JSON.parse(res, (key, value) => {
        if (typeof value === "string") {
          return utf8.decode(value);
        }
        return value;
      });
      resolve(response);
    });
  });
};

exports.exists = function(client, token) {
  return new Promise(function(resolve, reject) {
    if (!token) {
      resolve(0);
    } else {
      client.send_command("EXISTS", [token], (err, res) => {
        if (err) reject(err);

        resolve(res == 1);
      });
    }
  });
};
