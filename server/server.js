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
app.post('/todos', authenticate, async (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });
  try {
    const newTodo = await todo.save();
    res.status(200).send(newTodo);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/todos', authenticate, async (req, res) => {
  try {
    const todos = await Todo.find({ _creator: req.user._id });
    res.send({ todos });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/todos/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const todo = await Todo.findOne({
      _id: id,
      _creator: req.user._id
    });

    if (!todo) {
      return res.status(404).send();
    }
    res.status(200).send({ todo });
  } catch (error) {
    res.status(400).send();
  }
});

app.delete('/todos/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  try {
    const todo = await Todo.findOneAndRemove({
      _id: id,
      _creator: req.user._id
    });

    if (!todo) {
      return res.status(404).send();
    }
    res.status(200).send({ todo });
  } catch (error) {
    res.status(400).send(error);
  }
});

app.patch('/todos/:id', authenticate, async (req, res) => {
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

  try {
    const todo = await Todo.findOneAndUpdate(
      { _id: id, _creator: req.user._id },
      { $set: body },
      { new: true }
    );
    if (!todo) {
      return res.status(404).send();
    }
    res.status(200).send({ todo });
  } catch (error) {
    res.status(400).send();
  }
});

// USERS ROUTES
app.post('/users', async (req, res) => {
  const body = _.pick(req.body, ['email', 'password']);
  const user = new User(body);

  try {
    await user.save();
    const token = user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user); // from authenticated, will send 401 if not
});

app.post('/users/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findByCredentials(email, password);
    const token = await user.generateAuthToken();
    res.header('x-auth', token).send(user);
  } catch (error) {
    res.status(400).send();
  }
});

app.delete('/users/me/token', authenticate, async (req, res) => {
  const { user, token } = req;
  try {
    await user.removeToken(token);
    res.status(200).send();
  } catch (error) {
    res.status(400).send();
  }
});

// Server Start
app.listen(port, () => {
  console.log(`Started on port ${port}`);
});

module.exports = { app };
