const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

// make sure db is empty
beforeEach((done) => {
  Todo.remove({})
    .then(() => done());
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
        Todo.find() // check if todo added to mongoDB, fecth all todos
          .then((todos) => {
            expect(todos.length).toBe(1); // will just have one todo since beforeEach removed all
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
            expect(todos.length).toBe(0); // todo not added
            done();
          })
          .catch((err) => {
            done(err);
          });
      });
  });
});