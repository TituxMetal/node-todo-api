const {ObjectID} = require('mongodb')
const jwt = require('jsonwebtoken')
const {User} = require('./../../models/user')

const userOneId = new ObjectID()
const userTwoId = new ObjectID()
const jwtSalt = process.env.JWT_SALT
const users = [{
	_id: userOneId,
	email: 'titux@example.com',
	password: 'userOnePass',
	tokens: [{
		access: 'auth',
		token: jwt.sign({_id: userOneId, access: 'auth'}, jwtSalt).toString()
	}]
}, {
	_id: userTwoId,
	email: 'tux@example.com',
	password: 'userTwoPass',
	tokens: [{
		access: 'auth',
		token: jwt.sign({_id: userTwoId, access: 'auth'}, jwtSalt).toString()
	}]
}]

const populateUsers = (done) => {
	User.remove({}).then(() => {
		const userOne = new User(users[0]).save()
		const userTwo = new User(users[1]).save()

		return Promise.all([userOne, userTwo])
	}).then(() => done())
}

module.exports = {
	userOneId,
	userTwoId,
	users,
	populateUsers
}
