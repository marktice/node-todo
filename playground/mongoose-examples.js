// const newTodo = new Todo({
//   text: 'Cook dinner'
// });

// newTodo.save()
//   .then((result) => {
//     console.log(`Saved todo ${result}`);
//   }).catch((err) => {
//     console.log('Unable to save todo');
//   });

// const completeTodo = new Todo({
//   text: 'Get a job',
//   completed: true,
//   completedAt: 123
// });

// completeTodo.save().then((result) => {
//   console.log(`Saved todo ${result}`);
// }).catch((err) => {
//   console.log('Unable to save todo');
// });

// const notSavedTodo = new Todo({
//   text: '  Edit this video   '
// });

// notSavedTodo.save().then((result) => {
//   console.log(`Saved todo ${result}`);
// }).catch((err) => {
//   console.log('Unable to save todo', err);
// });

// User
// email - required - trim - type - min length 1

// new User({
//   email: '   andrew@email.com   '
// }).save().then((result) => {
//   console.log(`Saved useer: ${JSON.stringify(result, undefined, 2)}`);
// }).catch((err) => {
//   console.log('Unable to save todo', err);
// });