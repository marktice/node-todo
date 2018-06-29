require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

// TODOS ROUTES
app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
  });

  todo
    .save()
    .then((doc) => {
      res.send(doc);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.get('/todos', (req, res) => {
  Todo.find()
    .then((todos) => {
      res.send({ todos });
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.get('/todos/:id', (req, res) => {
  const { id } = req.params; // req.params is an object, w/key we gave(:id) { "id": "123" }
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findById(id)
    .then((todo) => {
      if (!todo) {
        return res.status(404).send();
      }
      res.status(200).send({ todo });
    })
    .catch((err) => {
      res.status(400).send();
    });
});

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(id)
    .then((todo) => {
      if (!todo) {
        return res.status(404).send();
      }
      res.status(200).send({ todo });
    })
    .catch((err) => {
      res.status(400).send();
    });
});

app.patch('/todos/:id', (req, res) => {
  const { id } = req.params;
  // dont want user to update everything used, so just pick of ones we want to update
  const body = _.pick(req.body, ['text', 'completed']);
  // pick: takes obj, returns obj w/arguements given

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }
  // check if body.completed is boolean and true
  if (body.completed === true) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }
  // takes: id, the changes in mongodb syntax, options - new just returns updated obj
  Todo.findByIdAndUpdate(id, { $set: body }, { new: true })
    .then((todo) => {
      if (!todo) {
        return res.status(404).send();
      }

      res.status(200).send({ todo });
    })
    .catch((err) => {
      res.status(400).send();
    });
});

// USERS ROUTES
app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  const user = new User(body);

  user
    .save()
    .then(() => {
      return user.generateAuthToken();
    })
    .then((token) => {
      res.header('x-auth', token).send(user);
    })
    .catch((err) => {
      res.status(400).send({ err });
    });
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user); // from authenticated, will send 401 if not
});

app.post('/users/login', (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password)
    .then((user) => {
      return user.generateAuthToken().then((token) => {
        res.header('x-auth', token).send(user);
      });
    })
    .catch((err) => {
      res.status(400).send();
    });
});

app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };
