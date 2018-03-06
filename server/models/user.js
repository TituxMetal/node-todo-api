const mongoose = require('mongoose')

const User = mongoose.model('User', {
	username: {
		type: String
	},
	email: {
		type: String,
		required: true,
		minlength: 1,
		trim: true
	},
	password: {
		type: String
	},
	todo: {
		type: String
	}
})

module.exports = { User }
