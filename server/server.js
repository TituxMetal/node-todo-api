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

app.listen(port, () => {
	console.log(`Started on port ${port}`)
})

module.exports = { app }
