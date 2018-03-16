const _ = require('lodash')
const {ObjectID} = require('mongodb')
const express = require('express')
const usersRoute = express.Router()

const {authenticate} = require('./../middleware/authenticate')
const {mongoose} = require('./../db/mongoose')
const {User} = require('./../models/user')

usersRoute.post('/', (req, res) => {
	let body = _.pick(req.body, ['email', 'password'])
	let user = new User(body)

	user.save().then((user) => {
		return user.generateAuthToken()
	}).then((token) => {
		res.header('x-auth', token).send(user)
	}).catch((err) => res.status(400).send(err))
})

// Login a user
usersRoute.post('/login', (req, res) => {
	let body = _.pick(req.body, ['email', 'password'])

	User.findByCredentials(body.email, body.password).then((user) => {
		return user.generateAuthToken().then((token) => {
			res.header('x-auth', token).send(user)
		})
	}).catch((err) => res.status(400).send(err))
})

// Get the current authenticated user
usersRoute.get('/me', authenticate, (req, res) => {
	res.send(req.user)
})

// Logout the current authenticated user
usersRoute.delete('/me/token', authenticate, (req, res) => {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send()
	}).catch((err) => res.status(400).send(err))
})

module.exports = usersRoute
