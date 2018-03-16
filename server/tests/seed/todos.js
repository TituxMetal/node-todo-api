const {ObjectID} = require('mongodb')
const jwt = require('jsonwebtoken')
const {Todo} = require('./../../models/todo')
const {userOneId, userTwoId} = require('./users')

const todos = [{
	_id: new ObjectID(),
	text: 'First test todo',
	_creator: userOneId
}, {
	_id: new ObjectID(),
	text: 'Second test todo',
	_creator: userTwoId,
	completed: true,
	completedAt: 333
}]

const populateTodos = (done) => {
	Todo.remove({}).then(() => {
		return Todo.insertMany(todos)
	}).then(() => done())
}

module.exports = {
	todos,
	populateTodos
}
