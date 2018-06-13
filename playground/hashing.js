const { SHA256 } = require('crypto-js');
const jwt = require('jsonwebtoken');

// WITH JWT
const data = {
  id: 10
};

const token = jwt.sign(data, '123abc'); // takes data and our secret salt
console.log(token);
const decoded = jwt.verify(token, '123abc'); // takes token and our secret salt
console.log('decoded', decoded); // returns our decoded data { id: 10, iat: 151231231 }


// // WITH SHA256
// const message = 'I am user number 3';
// const hash = SHA256(message).toString();

// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);

// const data = {
//   id: 4
// };
// const token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'somesalt').toString()
// };

// // hackzor!
// token.data.id = 5;
// token.hash = SHA256(JSON.stringify(token.data)).toString();

// const resultHash = SHA256(JSON.stringify(token.data) + 'somesalt').toString();
// if (resultHash === token.hash) {
//   console.log('Data was not changed');
// } else {
//   console.log('Data was change dont trust');
// }
