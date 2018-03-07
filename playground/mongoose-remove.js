const {ObjectID} = require('mongodb')

const {mongoose} = require('./../server/db/mongoose')
const {Todo} = require('./../server/models/todo')
const {User} = require('./../server/models/user')

// Todo.remove({}).then((result) => {
// 	console.log(result)
// })

// Todo.findOneAndRemove()
// Todo.findOneAndRemove({text: /todo/}).then((todo) => {
// 	console.log(todo)
// })

// Todo.findByIdAndRemove()
// Todo.findByIdAndRemove('5a9f78c05e2eddd92a763903').then((todo) => {
// 	console.log(todo)
// })
