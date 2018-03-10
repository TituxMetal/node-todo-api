const {SHA256} = require('crypto-js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

let password = '123aze!'

// bcrypt.genSalt(11, (err, salt) => {
// 	bcrypt.hash(password, salt, (err, hash) => {
// 		console.log(hash)
// 	})
// })

const hashedPassword = '$2a$11$ATtkZmWhGJJX66XGHNY.LeMHataIUev39Dk1xIFpHTXt6x/b0SBXK'

bcrypt.compare(password, hashedPassword, (err, res) => {
	console.log(res)
})

// const data = { id: 10 }
//
// const token = jwt.sign(data, '123aze')
// console.log(token)
//
// const decoded = jwt.verify(token, '123aze')
// console.log(decoded)

// const message = 'I am user number 3'
// const hash = SHA256(message).toString()
//
// console.log(`Message: ${message}`)
// console.log(`Hash: ${hash}`)

// const data = {
// 	id: 4
// }
//
// const token = {
// 	data,
// 	hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// }
//
// // token.data.id = 5
// // token.hash = SHA256(JSON.stringify(token.data)).toString()
//
// const resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString()
//
// if (resultHash === token.hash) {
// 	return console.log('Data was not changed')
// }
//
// return console.log('Data was changed, do not trust!')
