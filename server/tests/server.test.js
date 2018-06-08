const expect = require('expect');
const request = require('supertest');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const todos = [{
  text: 'First test todo'
}, {
  text: 'Second test todo'
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

describe('GET /todos', (done) => {
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
