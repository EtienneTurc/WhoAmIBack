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
