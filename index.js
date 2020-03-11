const express = require('express')
const session = require('express-session')
const app = express()
const config = require('./config/config')
const cors = require('cors')
const MongoStore = require('connect-mongo')(session);

const { checkGoogleLogin } = require('./app/google/google')
const { checkFacebookLogin } = require('./app/facebook/facebook')


app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(require('helmet')());
app.use(cors({ credentials: true, origin: true }))

const store = new MongoStore({
	url: 'mongodb://localhost/session',
	secret: config.storeSecret
})

app.use(session({
	secret: config.sessionSecret,
	resave: false,
	saveUninitialized: true,
	cookie: { httpOnly: true },
	store: store
}))

app.use("/login", require("./app/routes/login"))
app.use("/google", checkGoogleLogin, require("./app/routes/google"))
app.use("/analytics", checkGoogleLogin, require("./app/routes/analytics"))
app.use("/facebook", checkFacebookLogin, require("./app/routes/facebook"))

app.use((err, req, res, next) => {
	if (res.headersSent)
		return next(err)
	console.error(err.status, err.message)
	res.status(err.status || 500).json({ message: err.message || err })
})

app.listen(config.port, function () {
	console.log("Server running on port " + config.port)
})
