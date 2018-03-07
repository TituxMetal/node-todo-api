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

	todo.save().then((doc) => {
		res.send(doc)
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

// Delete a todo by its ID
app.delete('/todos/:id', (req, res) => {
	// get the Id
	const todoId = req.params.id

	// validate the Id => not valid ? return 404
	if (!ObjectID.isValid(todoId)) {
		return res.status(404).send()
	}

	// remove todo by id
	Todo.findByIdAndRemove(todoId).then((todo) => {
		// success
		// if no doc, send 404
		if (!todo) {
			return res.status(404).send()
		}

		// if doc, send the doc with 200
		res.send({ todo })

		// error
		// 400 with empty body
	}).catch((err) => res.status(404).send())
})

app.listen(port, () => {
	console.log(`Started on port ${port}`)
})

module.exports = { app }
