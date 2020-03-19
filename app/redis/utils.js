exports.setData = function (client, token, path, value) {
	client.send_command('JSON.SET', [token, "." + path, JSON.stringify(value)])
}

exports.getData = function (client, token, path) {
	return new Promise(function (resolve, reject) {
		client.send_command('JSON.GET', [token, "." + path], (err, res) => {
			if (err)
				reject(err)

			console.log(res)
			resolve(res)
		})
	});
}
