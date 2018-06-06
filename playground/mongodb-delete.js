
const {MongoClient, ObjectID} = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
  if (err) {
    console.log('Unable to connect to MongoDB server');
  }
  console.log('Connected to MongoDB server');

  // delete many
  db.collection('Todos').deleteMany({text: 'Eat lunch'})
    .then((result) => {
      console.log(result);
    }).catch((err) => {
      console.log(err);
    });

  // delete one (deletes first it finds then stops)
  db.collection('Todos').deleteOne({text: 'Eat lunch'})
    .then((result) => {
      console.log(result);
    }).catch((err) => {
      console.log(err);
    });

  // findOneAndDelete (gets document back, in .value)
  db.collection('Todos').findOneAndDelete({completed: false})
    .then((result) => {
      console.log(result);
    }).catch((err) => {
      console.log(err);
    });

  db.collection('Users').deleteMany({name: 'Mark'})
    .then((result) => {
      console.log(result);
    }).catch((err) => {
      console.log(err);
    });

  db.collection('Users').findOneAndDelete({_id: new ObjectID('5b1740df0cfbf84d4542ae56')})
    .then((result) => {
      console.log(result);
    }).catch((err) => {
      console.log(err);
    });

  // db.close();
});
