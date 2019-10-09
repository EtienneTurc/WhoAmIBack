const express = require('express')
const app = express()
const config = require('./config/config')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use("/", require("./app/routes/api"))

app.listen(config.port, function () {
	console.log("Server running on port " + config.port)
})
