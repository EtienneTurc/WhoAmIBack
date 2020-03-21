exports.setData = function (client, token, path, value) {
	return new Promise(function (resolve, reject) {
		client.send_command('JSON.SET', [token, "." + path, JSON.stringify(value)], (err, res) => {
			if (err) reject(err)

			resolve()
		})
	})
}

exports.getData = function (client, token, path) {
	return new Promise(function (resolve, reject) {
		client.send_command('JSON.GET', [token, "." + path], (err, res) => {
			if (err)
				reject(err)

			resolve(res)
		})
	});
}
