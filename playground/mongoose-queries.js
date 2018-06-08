const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

// const id = '5b1a003a6c82f111dec0afc71';

// if (!ObjectID.isValid(id)) {
//   console.log('ID not valid');
// }

// Todo.find({
//   _id: id // mongoose doesnt require to pass in objectID, will convert string automatically
// }).then((todos) => {
//   console.log('Todos', todos);
// });

// Todo.findOne({
//   _id: id
// }).then((todo) => {
//   console.log('Todo', todo);
// });

// Todo.findById(id)
//   .then((todo) => {
//     if (!todo) { // error will not get thrown if nothing found, have to add an if statement
//       return console.log('Id not found');
//     }
//     console.log('Todo by Id', todo);
//   })
//   .catch((err) => {
//     console.log(err); // handles error if invalid id, i.e. too long
//   });

const userId = '5b17709d74cb6f5320ed587d';

if (!ObjectID.isValid(userId)) {
  console.log('Id not valid');
} else {
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return console.log('User not found');
      }
      console.log('User email: ', user.email);
    }).catch((err) => {
      console.log(err);
    });
}
