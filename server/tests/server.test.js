const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const todos = [{
  _id: new ObjectID(),
  text: 'First test todo'
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333
}];

beforeEach((done) => {
  Todo.remove({ }) // make sure db is empty
    .then(() => {
      return Todo.insertMany(todos);
    })
    .then(() => {
      done();
    });
});

describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    const text = 'Test todo text';

    // using supertest
    request(app)
      .post('/todos')
      .send({ text }) // converted to json
      .expect(200) // assert status code
      .expect((res) => { // custom expect assertion
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
      .send({ })
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
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    const { _id } = todos[0];
    request(app)
      .get(`/todos/${_id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      })
      .end(done);
  });

  it('should return 404 if todo not found', (done) => {
    const id = new ObjectID();
    request(app)
      .get(`/todos/${id}`)
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
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('DELETE todos/:id', () => {
  it('should remove a todo', (done) => {
    const { _id } = todos[0]; // hexId = todos[0]._id.toHexStrong();

    request(app)
      .delete(`/todos/${_id}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
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

  it('should return 404 if todo not found', (done) => {
    const id = new ObjectID();
    request(app)
      .delete(`/todos/${id}`)
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
      .expect(404)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    const { _id } = todos[1];
    const updatedValues = { text: 'Updated from test', completed: true };

    request(app)
      .patch(`/todos/${_id}`)
      .send(updatedValues)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(updatedValues.text);
        expect(res.body.todo.completed).toBe(true);
        expect(typeof res.body.todo.completedAt).toBe('number');
      })
      .end(done);
  });

  it('should clear completedAt when todo is not completed', (done) => {
    const { _id } = todos[1];
    const updatedValues = { text: 'Updated from test', completed: false };

    request(app)
      .patch(`/todos/${_id}`)
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
