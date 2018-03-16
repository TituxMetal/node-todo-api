const env = require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')

const usersRoute = require('./routes/users')
const todosRoute = require('./routes/todos')
const {User} = require('./models/user')

const app = express()
const port = process.env.PORT || 3000

// app.use((req, res, next) => {
// 	console.log(`START request on server.js`)
// 	console.log(`Method ${req.method}, Url: ${req.url}, Time: ${Date.now()}`)
//   next()
// })

app.use(bodyParser.json())

app.use('/api/todos', todosRoute)
app.use('/api/users', usersRoute)

app.listen(port, () => {
	console.log(`Started on port ${port}`)
})

module.exports = { app }
