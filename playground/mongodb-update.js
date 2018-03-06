// const MongoClient = require('mongodb').MongoClient
const {MongoClient, ObjectID} = require('mongodb')

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server')
	}
	console.log('Connected to MongoDB server')
	const db = client.db('TodoApp')

	// db.collection('Todos').findOneAndUpdate({
	// 	_id: ObjectID('5a9d8d53ef9a43ef521d81e8')
	// }, {
	// 	$set: {
	// 		completed: true
	// 	}
	// }, {
	// 	returnOriginal: false
	// }).then((result) => {
	// 	console.log(JSON.stringify(result, undefined, 2))
	// })

	db.collection('Users').findOneAndUpdate(
		{ _id: ObjectID('5a9d899bdf26db3a109c5861') },
		{ $set: { name: 'TItux' }, $inc: { age: 1 } },
		{ returnOriginal: false }
	).then((result) => console.log(JSON.stringify(result, undefined, 2)))

	client.close()
})
