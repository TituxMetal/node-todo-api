const expect = require('expect')
const request = require('supertest')
const {ObjectID} = require('mongodb')
const path = require('path')

const serverPath = path.join(__dirname, '../server')
const modelsPath = serverPath + '/models/'

const {app} = require(serverPath + '/server')
const {Todo} = require(modelsPath + '/todo')
const {todos, populateTodos} = require('./seed/todos')
const {users, populateUsers} = require('./seed/users')

beforeEach(populateUsers)
beforeEach(populateTodos)

describe('POST /api/todos', () => {
	it('should create a new todo', (done) => {
		const text = 'Test todo text'

		request(app)
			.post('/api/todos')
			.set('x-auth', users[0].tokens[0].token)
			.send({ text })
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(text)
			})
			.end((err, res) => {
				if (err) {
					return done(err)
				}

				Todo.find({ text }).then((todos) => {
					expect(todos.length).toBe(1)
					expect(todos[0].text).toBe(text)
					done()
				}).catch((e) => done(e))
			})
	})

	it('should not create todo with invalid data', (done) => {
		request(app)
			.post('/api/todos')
			.set('x-auth', users[0].tokens[0].token)
			.send({})
			.expect(400)
			.end((err, res) => {
				if (err) {
					return done(err)
				}

				Todo.find().then((todo) => {
					expect(todo.length).toBe(2)
					done()
				}).catch((e) => done(e))
			})
	})
})

describe('GET /api/todos', () => {
	it('should get all todos', (done) => {
		request(app)
			.get('/api/todos')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body.todos.length).toBe(1)
			})
			.end(done)
	})
})

describe('GET /api/todos/:id', () => {
	it('should return todo', (done) => {
		request(app)
			.get(`/api/todos/${todos[0]._id.toHexString()}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(todos[0].text)
			})
			.end(done)
	})

	it('should not return todo created be another user', (done) => {
		request(app)
			.get(`/api/todos/${todos[0]._id.toHexString()}`)
			.set('x-auth', users[1].tokens[0].token)
			.expect(404)
			.expect((res) => {
				expect(res.body.todo).toNotExist()
			})
			.end(done)
	})

	it('should return 404 if todo not found', (done) => {
		const hexId = new ObjectID().toHexString()

		request(app)
			.get(`/api/todos/${hexId}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.end(done)
	})

	it('should return 404 for non-object ids', (done) => {
		request(app)
			.get('/api/todos/123abc')
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.end(done)
	})
})

describe('PATCH /api/todos/:id', () => {
	it('should update the todo', (done) => {
		const hexId = todos[0]._id.toHexString()
		const updatedTodo = { text: 'Updated text', completed: true }

		request(app)
			.patch(`/api/todos/${hexId}`)
			.set('x-auth', users[0].tokens[0].token)
			.send(updatedTodo)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(updatedTodo.text)
				expect(res.body.todo.completed).toBe(true)
				expect(res.body.todo.completedAt).toBeA('number')
			})
			.end(done)
	})

	it('should not update the todo created by another user', (done) => {
		const hexId = todos[0]._id.toHexString()
		const updatedTodo = { text: 'Updated text', completed: true }

		request(app)
			.patch(`/api/todos/${hexId}`)
			.set('x-auth', users[1].tokens[0].token)
			.send(updatedTodo)
			.expect(404)
			.expect((res) => {
				expect(res.body.todo).toNotExist()
			})
			.end(done)
	})

	it('should clear completedAt when todo is not completed', (done) => {
		const hexId = todos[1]._id.toHexString()
		const updatedTodo = { text: 'Updated todos text', completed: false }

		request(app)
			.patch(`/api/todos/${hexId}`)
			.set('x-auth', users[1].tokens[0].token)
			.send(updatedTodo)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(updatedTodo.text)
				expect(res.body.todo.completed).toBe(false)
				expect(res.body.todo.completedAt).toNotExist()
			})
			.end(done)
	})

	it('should return 404 if not found todo', (done) => {
		const hexId = ObjectID().toHexString()

		request(app)
			.patch(`/api/todos/${hexId}`)
			.set('x-auth', users[0].tokens[0].token)
			.send({ text: 'not found' })
			.expect(404)
			.end(done)
	})

	it('should return 404 for non-object ids', (done) => {
		request(app)
		.patch('/api/todos/123aze')
		.set('x-auth', users[0].tokens[0].token)
		.send({ text: 'not found' })
		.expect(404)
		.end(done)
	})
})

describe('DELETE /api/todos/:id', () => {
	it('should remove a todo', (done) => {
		const hexId = todos[1]._id.toHexString()

		request(app)
			.delete(`/api/todos/${hexId}`)
			.set('x-auth', users[1].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo._id).toBe(hexId)
			})
			.end((err, res) => {
				if (err) {
					return done(err)
				}

				Todo.findById(hexId).then((todo) => {
					expect(todo).toNotExist()
					done()
				}).catch((err) => done(err))
			})
	})

	it('should not remove a todo created by another user', (done) => {
		const hexId = todos[0]._id.toHexString()

		request(app)
			.delete(`/api/todos/${hexId}`)
			.set('x-auth', users[1].tokens[0].token)
			.expect(404)
			.expect((res) => {
				expect(res.body.todo).toNotExist()
			})
			.end((err, res) => {
				if (err) {
					return done(err)
				}

				Todo.findById(hexId).then((todo) => {
					expect(todo).toExist()
					done()
				}).catch((err) => done(err))
			})
	})

	it('should return 404 if todo not found', (done) => {
		const hexId = ObjectID().toHexString()

		request(app)
			.delete(`/api/todos/${hexId}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.end(done)
	})

	it('should return 404 for non-object ids', (done) => {
		request(app)
			.delete('/api/todos/123abc')
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.end(done)
	})
})
