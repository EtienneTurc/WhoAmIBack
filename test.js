var mqtt = require('mqtt')
var client = mqtt.connect('mqtt://localhost:1883')

client.on('connect', function () {
	console.log("ih")
	client.subscribe("bla", (err) => {
		client.publish('bo', 'Hello mqtt')
	})
})

client.on('message', function (chanel, message) {
	// message is Buffer
	// if (channel == 'people') {
	// 	analysePeople()
	// } else if (mail) {
	// 	analyseMail()
	// }
	console.log(chanel)
	console.log(message.toString())
	client.end()
})
