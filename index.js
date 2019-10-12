const express = require('express')
const app = express()
const config = require('./config/config')
const cors = require('cors')

const { setToken } = require('./app/google/google')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cors({ credentials: true, origin: true }))

app.use("/login", require("./app/routes/login"))
app.use("/google", setToken, require("./app/routes/google"))

app.listen(config.port, function () {
	console.log("Server running on port " + config.port)
})
