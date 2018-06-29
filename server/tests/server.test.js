const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

// TODO tests
describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    const text = 'Test todo text';

    // using supertest
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({ text }) // converted to json
      .expect(200) // assert status code
      .expect((res) => {
        // custom expect assertion
        expect(res.body.text).toBe(text); // pass it the response, which has a body we can check
      })
      .end((err, res) => {
        if (err) {
          return done(err); // if error end test
        }
        Todo.find({ text }) // check if todo added to mongoDB
          .then((todos) => {
            expect(todos.length).toBe(1);
            expect(todos[0].text).toBe(text);
            done();
          })
          .catch((e) => done(e));
      });
  });

  it('should not create todo with invalid body data', (done) => {
    request(app)
      .post('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .send({})
      .expect(400) // 400 is BAD REQUEST
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find()
          .then((todos) => {
            expect(todos.length).toBe(2); // todo not added
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    const { _id } = todos[0];
    request(app)
      .get(`/todos/${_id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should not return todo doc created by other user', (done) => {
    const { _id } = todos[1];
    request(app)
      .get(`/todos/${_id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    const id = new ObjectID();
    request(app)
      .get(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

  it('should return 404 for non-object ids', (done) => {
    const id = '123';
    request(app)
      .get(`/todos/${id}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('DELETE todos/:id', () => {
  it('should remove a todo', (done) => {
    const { _id } = todos[1]; // hexId = todos[0]._id.toHexStrong();

    request(app)
      .delete(`/todos/${_id}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[1].text);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(_id)
          .then((todo) => {
            expect(todo).toBeFalsy();
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
  });

  it('should not remove a todo as created by other user', (done) => {
    const { _id } = todos[0];

    request(app)
      .delete(`/todos/${_id}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.findById(_id)
          .then((todo) => {
            expect(todo).toBeTruthy();
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
  });

  it('should return 404 if todo not found', (done) => {
    const id = new ObjectID();
    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });

  it('should return 404 if objectID is invalid', (done) => {
    const id = '123';
    request(app)
      .delete(`/todos/${id}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    const { _id } = todos[0];
    const updatedValues = { text: 'Updated from test', completed: true };

    request(app)
      .patch(`/todos/${_id}`)
      .set('x-auth', users[0].tokens[0].token)
      .send(updatedValues)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(updatedValues.text);
        expect(res.body.todo.completed).toBe(true);
        expect(typeof res.body.todo.completedAt).toBe('number');
      })
      .end(done);
  });

  it('should not update the todo created by other user', (done) => {
    const { _id } = todos[0];
    const updatedValues = { text: 'Updated from test', completed: true };

    request(app)
      .patch(`/todos/${_id}`)
      .set('x-auth', users[1].tokens[0].token)
      .send(updatedValues)
      .expect(404)
      .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    const { _id } = todos[1];
    const updatedValues = { text: 'Updated from test', completed: false };

    request(app)
      .patch(`/todos/${_id}`)
      .set('x-auth', users[1].tokens[0].token)
      .send(updatedValues)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(updatedValues.text);
        expect(res.body.todo.completed).toBe(false);
        expect(res.body.todo.completedAt).toBe(null);
      })
      .end(done);
  });
});

// USERS tests
describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    const email = 'example@example.com';
    const password = 'password123';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({ email })
          .then((user) => {
            expect(user).toBeTruthy();
            expect(user.password).not.toBe(password); // since hashed
            done();
          })
          .catch((err) => {
            return done(err);
          });
      });
  });

  it('should return validation errors if request invalid', (done) => {
    const email = 'bad';
    const password = '123';

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end(done);
  });

  it('should not create user if email in user', (done) => {
    const { email, password } = users[0];

    request(app)
      .post('/users')
      .send({ email, password })
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    const { _id, email, password } = users[1];

    request(app)
      .post('/users/login')
      .send({ email, password })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeTruthy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(_id)
          .then((user) => {
            expect(user.tokens[1]).toMatchObject({
              access: 'auth',
              token: res.headers['x-auth']
            });
            done();
          })
          .catch((err) => {
            return done(err);
          });
      });
  });

  it('should reject invalid login', (done) => {
    const { _id, email } = users[1];
    const password = 'incorrectPassword';

    request(app)
      .post('/users/login')
      .send({ email, password })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toBeFalsy();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(_id)
          .then((user) => {
            expect(user.tokens.length).toBe(1);
            done();
          })
          .catch((err) => {
            return done(err);
          });
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id)
          .then((user) => {
            expect(user.tokens.length).toBe(0);
            done();
          })
          .catch((err) => {
            return done(err);
          });
      });
  });
});
