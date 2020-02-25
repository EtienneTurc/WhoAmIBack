const fs = require('fs');

exports.check = (el, status, message) => {
	if (!el) throw { status, message }
}

exports.saveJson = async (fileName, json) => {
	await fs.writeFile(fileName, JSON.stringify(json), function (err) {
		if (err) {
			console.log(err);
		}
		console.log("The file was saved!");
	});
}

exports.waitDefined = async (json, key) => {
	return new Promise(function (resolve, reject) {
		var observerInterval = setInterval(function () {
			if (json[key]) {
				clearInterval(observerInterval);
				resolve()
			}
		}, 1000);
	});
}
