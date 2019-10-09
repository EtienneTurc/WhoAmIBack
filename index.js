const express = require('express')
const app = express()
const config = require('./config/config')


app.get("/", (req, res) => {
	res.send("hi")
})

app.listen(config.port, function () {
	console.log("Server running on port " + config.port)
})
