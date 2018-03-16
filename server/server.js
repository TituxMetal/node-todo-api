const env = require('dotenv').config()
const _ = require('lodash')
const express = require('express')
const bodyParser = require('body-parser')
const {ObjectID} = require('mongodb')

const {mongoose} = require('./db/mongoose')
const {Todo} = require('./models/todo')
const {User} = require('./models/user')
const {authenticate} = require('./middleware/authenticate')

const app = express()

const port = process.env.PORT || 3000

app.use(bodyParser.json())

// Create a todo
app.post('/todos', authenticate, (req, res) => {
	const todo = new Todo({
		text: req.body.text,
		_creator: req.user._id
	})

	todo.save().then((todo) => {
		res.send({ todo })
	}).catch((err) => {
		res.status(400).send(err)
	})
})

// Get all todos
app.get('/todos', authenticate, (req, res) => {
	Todo.find({ _creator: req.user._id }).then((todos) => {
		res.status(200).send({ todos })
	}).catch((err) => res.status(400).send(err))
})

// Get a single todos by its ID
app.get('/todos/:id', authenticate, (req, res) => {
	const todoId = req.params.id

	if (!ObjectID.isValid(todoId)) {
		return res.status(404).send()
	}

	Todo.findOne({ _id: todoId, _creator: req.user._id }).then((todo) => {
		if (!todo) {
			return res.status(404).send()
		}

		res.send({ todo })

	}).catch((err) => res.status(400).send())
})

// Partial update a single todo by its ID
app.patch('/todos/:id', authenticate, (req, res) => {
	const id = req.params.id
	let body = _.pick(req.body, ['text', 'completed'])

	if (!ObjectID.isValid(id)) {
		return res.status(404).send()
	}

	if (_.isBoolean(body.completed) && body.completed) {
		body.completedAt = new Date().getTime()
	} else {
		body.completed = false
		body.completedAt = null
	}

	Todo.findOneAndUpdate({ _id: id, _creator: req.user._id }, { $set: body }, { new: true }).then((todo) => {
		if (!todo) {
			return res.status(404).send()
		}

		res.send({ todo })
	}).catch((e) => res.status(400).send())
})

// Delete a todo by its ID
app.delete('/todos/:id', authenticate, (req, res) => {
	const todoId = req.params.id

	if (!ObjectID.isValid(todoId)) {
		return res.status(404).send()
	}

	Todo.findOneAndRemove({ _id: todoId, _creator: req.user._id }).then((todo) => {
		if (!todo) {
			return res.status(404).send()
		}

		res.send({ todo })

	}).catch((err) => res.status(404).send())
})

// Signup a new user
app.post('/users', (req, res) => {
	let body = _.pick(req.body, ['email', 'password'])
	let user = new User(body)

	user.save().then((user) => {
		return user.generateAuthToken()
	}).then((token) => {
		res.header('x-auth', token).send(user)
	}).catch((err) => res.status(400).send(err))
})

// Login a user
app.post('/users/login', (req, res) => {
	let body = _.pick(req.body, ['email', 'password'])

	User.findByCredentials(body.email, body.password).then((user) => {
		return user.generateAuthToken().then((token) => {
			res.header('x-auth', token).send(user)
		})
	}).catch((err) => res.status(400).send(err))
})

// Get the current authenticated user
app.get('/users/me', authenticate, (req, res) => {
	res.send(req.user)
})

// Logout the current authenticated user
app.delete('/users/me/token', authenticate, (req, res) => {
	req.user.removeToken(req.token).then(() => {
		res.status(200).send()
	}).catch((err) => res.status(400).send(err))
})

app.listen(port, () => {
	console.log(`Started on port ${port}`)
})

module.exports = { app }
