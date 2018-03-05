// const MongoClient = require('mongodb').MongoClient
const {MongoClient, ObjectID} = require('mongodb')

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server')
	}
	console.log('Connected to MongoDB server')
	const db = client.db('TodoApp')

	// db.collection('Todos').find({
	// 	_id: new ObjectID('5a9d8d53ef9a43ef521d81e8')
	// }).toArray().then((docs) => {
	// 	console.log('Todos')
	// 	console.log(JSON.stringify(docs, undefined, 2))
	// }, (err) => {
	// 	console.log('Unable to fetch todos', err)
	// })

	// db.collection('Todos').find().count().then((count) => {
	// 	console.log(`Todos count: ${count}`)
	// }, (err) => {
	// 	console.log('Unable to fetch todos', err)
	// })

	db.collection('Users').find({name: 'Titux'}).toArray().then((docs) => {
		console.log(JSON.stringify(docs, undefined, 2))
	}, (err) => {
		console.log('Unable to find users with name of Titux')
	})

	db.collection('Users').find({name: 'Titux'}).count().then((count) => {
		console.log(`Users with Titux name's count: ${count}`)
	}, (err) => {
		console.log('Unable to count users with the name Titux')
	})

	client.close()
})
