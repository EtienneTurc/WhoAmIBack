const mqtt = require('mqtt')

let callback1 = function () {
	console.log("callback1")
}


let storeMail = function () {
	console.log("callback2")
}

client.on

let subs = { "sub1": callback1, "sub2": callback2 }

let client = mqtt.connect('mqtt://localhost:1883')
client.on('connect', function () {
	console.log("connection")
	for (let sub of Object.keys(subs)) {
		client.subscribe(sub)
	}
})

client.on('message', function (channel, message) {
	if (channel == "sub1") {
		subs[channel]()
	}
})


client.on('message', function (channel, message) {
	if (channel == "sub2") {
		subs[channel]()
	}
})

setInterval(() => {
	// client.publish("sub1", "Done")
	client.publish("sub2", "Done")
}, 3000);
