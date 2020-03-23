exports.setData = function (client, token, path, value) {
	return new Promise(function (resolve, reject) {
		client.send_command('JSON.SET', [token, "." + path, JSON.stringify(value)], (err, res) => {
			if (err) reject(err)
			// console.log(path, value)
			resolve()
		})
	})
}

exports.getData = function (client, token, path) {
	return new Promise(function (resolve, reject) {
		client.send_command('JSON.GET', [token, "." + path], (err, res) => {
			if (err)
				reject(err)

			resolve(JSON.parse(res))
		})
	});
}

exports.exists = function (client, token) {
	return new Promise(function (resolve, reject) {
		if (!token) {
			resolve(0)
		} else {
			client.send_command('EXISTS', [token], (err, res) => {
				if (err)
					reject(err)

				resolve(res == 1)
			})
		}
	});
}
