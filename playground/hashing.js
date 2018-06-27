// const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');
// const bcrypt = require('bcryptjs');

// const password = '123abc!';

// .gensalt takes amount of rounds and a callback
// .hash takes original password, salt, and callback with err and hash

// bcrypt.genSalt(10, (err, salt) => {
//   bcrypt.hash(password, salt, (err, hash) => {
//     console.log(hash);
//   });
// });

// const hashedPassword = '$2a$10$d7Z4kaZ2miUcCUfM5uFnMu9TywsD0i6RBYy7fkofm7.BFzWTs0AE6';

// // res is a boolean comparing the two
// bcrypt.compare(password, hashedPassword, (err, res) => {
//   console.log(res);
// });

// WITH JWT

const data = {
  id: 10
};

const token = jwt.sign(data, '123abc'); // takes data and our secret salt
const decoded = jwt.verify(token, '123abc'); // takes token and our secret salt
console.log(token);
console.log('decoded', decoded); // returns our decoded data { id: 10, iat: 151231231 }

// // WITH SHA256
const message = 'I am user number 3';
const hash = SHA256(message).toString();

console.log(`Message: ${message}`);
console.log(`Hash: ${hash}`);

const data = {
  id: 4
};
const token = {
  data,
  hash: SHA256(JSON.stringify(data) + 'somesalt').toString()
};

// hackzor!
token.data.id = 5;
token.hash = SHA256(JSON.stringify(token.data)).toString();

const resultHash = SHA256(JSON.stringify(token.data) + 'somesalt').toString();
if (resultHash === token.hash) {
  console.log('Data was not changed');
} else {
  console.log('Data was change dont trust');
}
