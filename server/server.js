const env = require('dotenv').config()
const _ = require('lodash')
const express = require('express')
const bodyParser = require('body-parser')
const {ObjectID} = require('mongodb')

const {mongoose} = require('./db/mongoose')
const {Todo} = require('./models/todo')
const {User} = require('./models/user')

const app = express()

const port = process.env.PORT || 3000

app.use(bodyParser.json())

// Create a todo
app.post('/todos', (req, res) => {
	const todo = new Todo({ text: req.body.text })

	todo.save().then((todo) => {
		res.send({ todo })
	}).catch((err) => {
		res.status(400).send(err)
	})
})

// Get all todos
app.get('/todos', (req, res) => {
	Todo.find().then((todos) => {
		res.status(200).send({ todos })
	}).catch((err) => res.status(400).send(err))
})

// Get a single todos by its ID
app.get('/todos/:id', (req, res) => {
	const todoId = req.params.id

	if (!ObjectID.isValid(todoId)) {
		return res.status(404).send()
	}

	Todo.findById(todoId).then((todo) => {
		if (!todo) {
			return res.status(404).send()
		}

		res.send({ todo })

	}).catch((err) => res.status(400).send())
})

// Partial update a single todo by its ID
app.patch('/todos/:id', (req, res) => {
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

	Todo.findByIdAndUpdate(id, { $set: body }, { new: true }).then((todo) => {
		if (!todo) {
			return res.status(404).send()
		}

		res.send({ todo })
	}).catch((e) => res.status(400).send())
})

// Delete a todo by its ID
app.delete('/todos/:id', (req, res) => {
	const todoId = req.params.id

	if (!ObjectID.isValid(todoId)) {
		return res.status(404).send()
	}

	Todo.findByIdAndRemove(todoId).then((todo) => {
		if (!todo) {
			return res.status(404).send()
		}

		res.send({ todo })

	}).catch((err) => res.status(404).send())
})

app.post('/users', (req, res) => {
	let body = _.pick(req.body, ['email', 'password'])
	let user = new User(body)

	user.save().then((user) => {
		return user.generateAuthToken()
	}).then((token) => {
		res.header('x-auth', token).send(user)
	}).catch((err) => res.status(400).send(err))
})

app.listen(port, () => {
	console.log(`Started on port ${port}`)
})

module.exports = { app }
