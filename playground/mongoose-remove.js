const { ObjectID } = require('mongodb');

const { mongoose } = require('./../server/db/mongoose');
const { Todo } = require('./../server/models/todo');
const { User } = require('./../server/models/user');

// Todo.remove({}).then((result) => {
//   console.log(result);
// }).catch((err) => {
// });

// return doc and remove
// Todo.findOneAndRemove
// Todo.findByIdAndRemove

Todo.findOneAndRemove({ _id: '5b1c93b993be1f2f0a736822' }).then((todo) => {
  console.log(todo);
}); // .catch((err) => {
// });

Todo.findByIdAndRemove('5b1c93b993be1f2f0a736822').then((todo) => {
  console.log(todo);
}); // .catch((err) => {
// });
