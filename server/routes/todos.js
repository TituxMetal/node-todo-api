const _ = require('lodash')
const {ObjectID} = require('mongodb')
const express = require('express')
const todosRoute = express.Router()

const {authenticate} = require('./../middleware/authenticate')
const {mongoose} = require('./../db/mongoose')
const {Todo} = require('./../models/todo')

// Create a todo
todosRoute.post('/', authenticate, (req, res) => {
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
todosRoute.get('/', authenticate, (req, res) => {
	Todo.find({ _creator: req.user._id }).then((todos) => {
		res.status(200).send({ todos })
	}).catch((err) => res.status(400).send(err))
})

// Get a single todos by its ID
todosRoute.get('/:id', authenticate, (req, res) => {
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
todosRoute.patch('/:id', authenticate, (req, res) => {
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
todosRoute.delete('/:id', authenticate, (req, res) => {
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


module.exports = todosRoute
