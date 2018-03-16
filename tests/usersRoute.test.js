const expect = require('expect')
const request = require('supertest')
const path = require('path')

const serverPath = path.join(__dirname, '../server')
const modelsPath = serverPath + '/models/'

const {app} = require(serverPath + '/server')
const {User} = require(modelsPath + '/user')
const {users, populateUsers} = require('./seed/users')

beforeEach(populateUsers)

describe('GET /api/users/me', () => {
	it('should return user if authenticated', (done) => {
		request(app)
			.get('/api/users/me')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body._id).toBe(users[0]._id.toHexString())
				expect(res.body.email).toBe(users[0].email)
			})
			.end(done)
	})

	it('should return 401 if not authenticated', (done) => {
		request(app)
			.get('/api/users/me')
			.expect(401)
			.expect((res) => {
				expect(res.body).toEqual({})
			})
			.end(done)
	})
})

describe('POST /api/users', () => {
	it('should create a user', (done) => {
		const email = 'test@test.com'
		const password = 'aze123!'

		request(app)
			.post('/api/users')
			.send({ email, password })
			.expect(200)
			.expect((res) => {
				expect(res.headers['x-auth']).toExist()
				expect(res.body._id).toExist()
				expect(res.body.email).toBe(email)
			})
			.end((err) => {
				if (err) {
					return done(err)
				}

				User.findOne({email}).then((user) => {
					expect(user).toExist()
					expect(user.password).toNotBe(password)
					expect(user.tokens[0].access).toBe('auth')
					expect(user.tokens[0].token).toExist()
					done()
				}).catch((err) => done(err))
			})
	})

	it('should return validation errors if request is invalid', (done) => {
		const invalidEmail = 'test@invalid'
		const invalidPassword = 'test!'

		request(app)
			.post('/api/users')
			.send({ invalidEmail, invalidPassword })
			.expect(400)
			.expect((res) => {
				expect(res.body.message).toExist()
			})
			.end(done)
	})

	it('should not create user if email is in use', (done) => {
		const password = 'test123!'

		request(app)
			.post('/api/users')
			.send({ email: users[0].email, password })
			.expect(400)
			.expect((res) => {
				expect(res.body.code).toExist()
			})
			.end(done)
	})
})

describe('POST /api/users/login', () => {
	it('should login user and return auth login', (done) => {
		request(app)
			.post('/api/users/login')
			.send({ email: users[1].email, password: users[1].password })
			.expect(200)
			.expect((res) => {
				expect(res.headers['x-auth']).toExist()
			})
			.end((err, res) => {
				if (err) {
					return done(err)
				}

				User.findById(users[1]._id).then((user) => {
					expect(user.tokens[1]).toInclude({
						'access': 'auth',
						'token': res.headers['x-auth']
					})
					done()
				}).catch((err) => done(err))
			})
	})

	it('should reject invalid login', (done) => {
		request(app)
			.post('/api/users/login')
			.send({ email: users[1].email, password: 'aze123!' })
			.expect(400)
			.expect((res) => {
				expect(res.headers['x-auth']).toNotExist()
			})
			.end((err, res) => {
				if (err) {
					return done(err)
				}

				User.findById(users[1]._id).then((user) => {
					expect(user.tokens.length).toBe(1)
					done()
				}).catch((err) => done(err))
			})
	})
})

describe('DELETE /api/users/me/token', () => {
	it('should remove auth token on logout', (done) => {
		request(app)
			.delete('/api/users/me/token')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.end((err, res) => {
				if (err) {
					return done(err)
				}

				User.findById(users[0]._id).then((user) => {
					expect(user.tokens.length).toBe(0)
					done()
				}).catch((err) => done(err))
			})
	})
})
