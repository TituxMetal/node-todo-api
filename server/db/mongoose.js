const mongoose = require('mongoose')
const dbUri = process.env.NODE_ENV !== 'test' ? process.env.MONGODB_URI : 'mongodb://localhost:27017/TodoAppTest'

mongoose.Promise = global.Promise
mongoose.connect(dbUri)

module.exports = { mongoose }
