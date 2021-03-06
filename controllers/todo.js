const { errorHandler } = require('../util/misc');
const respondModel = require('../util/responseModel');
const Todo = require('../models/todo');
const User = require('../models/user');

exports.getTodos = (req, res, next) =>
{
  const currentPage = req.query.page || 1;
  const perPage = 10;
  let totalItems;

  Todo.find({ 'creator': req.query.userId })
    .countDocuments()
    .then(count =>
    {
      totalItems = count;
      return Todo.find({ 'creator': req.query.userId })
        .skip((currentPage - 1) * perPage)
        .limit(perPage);
    })
    .then(todos =>
    {
      const response = new respondModel({ todos, totalItems }, 200, 'Fetched items successfully.');
      res.json(response);
    })
    .catch(err =>
    {
      err = errorHandler(err);
      next(err);
    });
}

exports.createTodo = (req, res, next) =>
{
  const { content } = req.body;
  let creator;

  const todo = new Todo({
    content,
    creator: req.body.userId
  });

  todo.save()
    .then(() =>
    {
      return User.findById(req.body.userId);
    })
    .then(user =>
    {
      creator = user;
      user.todos.push(todo);
      return user.save();
    })
    .then(() =>
    {
      const respond = new respondModel(
        {
          todoID: todo._id,
          creator: { _id: creator._id, name: creator.name }
        }, 201, 'Todo created successfully!');

      res.json(respond);
    })
    .catch(err =>
    {
      err = errorHandler(err);
      next(err);
    });
}

exports.toggleTodo = (req, res, next) =>
{
  const { todoId } = req.params;
  Todo.findById(todoId)
    .then(todo =>
    {
      checkTodoAvalability(todo);
      checkAuthorization(todo, req.query.userId);

      todo.completed = !todo.completed;
      return todo.save();
    })
    .then(() =>
    {
      const respond = new respondModel({}, 200, 'Todo toggled!');
      res.json(respond);
    })
    .catch(err =>
    {
      err = errorHandler(err);
      next(err);
    });
}

exports.updateTodo = (req, res, next) =>
{
  const { todoId } = req.body;
  const { content } = req.body;

  Todo.findById(todoId)
    .then(todo =>
    {
      checkTodoAvalability(todo);
      checkAuthorization(todo, req.body.userId);

      todo.content = content;
      return todo.save();
    })
    .then(() =>
    {
      const respond = new respondModel({}, 200, 'Todo updated!');
      res.json(respond);
    })
    .catch(err =>
    {
      err = errorHandler(err);
      next(err);
    });
}

exports.deleteTodo = (req, res, next) =>
{
  const todoId = req.params.todoId;
  Todo.findById(todoId)
    .then(todo =>
    {
      checkTodoAvalability(todo);
      checkAuthorization(todo, req.query.userId);

      // Check logged in user
      return Todo.findByIdAndRemove(todoId);
    })
    .then(() =>
    {
      return User.findById(req.query.userId);
    })
    .then(user =>
    {
      user.todos.pull(todoId);
      return user.save();
    })
    .then(() =>
    {
      const respond = new respondModel({}, 200, 'Deleted todo.');
      res.json(respond);
    })
    .catch(err =>
    {
      err = errorHandler(err);
      next(err);
    });
}

const checkTodoAvalability = todo =>
{
  if (!todo)
  {
    const error = new Error('Could not find todo.');
    error.statusCode = 404;
    throw error;
  }
}

const checkAuthorization = (todo, userId) =>
{
  if (todo.creator.toString() !== userId)
  {
    const error = new Error('Not authorized!');
    error.statusCode = 403;
    throw error;
  }
}
