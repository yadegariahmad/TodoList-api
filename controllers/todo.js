const Pagination = require('../util/pagination');
const { errorHandler } = require('../util/misc');
const Todo = require('../models/todo');
const User = require('../models/user');

exports.getTodos = (req, res, next) =>
{
  const currentPage = req.query.page || 1;
  const perPage = 8;

  const _pagination = Pagination(Todo, currentPage, perPage);
  _pagination.Response
    .then(todos =>
    {
      res.status(200).json({
        message: 'Fetched items successfully.',
        todos: todos,
        totalItems: _pagination.totalItems
      });
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
      return User._findById(req.body.userId);
    })
    .then(user =>
    {
      creator = user;
      user.todos.push(todo);
      return user.save();
    })
    .then(() =>
    {
      res.status(201).json({
        message: 'Todo created successfully!',
        todo,
        creator: { _id: creator._id, name: creator.name }
      });
    })
    .catch(err =>
    {
      err = errorHandler(err);
      next(err);
    });
}

exports.getTodo = (req, res, next) =>
{
  const { todoId } = req.params.todoId;
  User.findById(todoId)
    .then(todo =>
    {
      checkTodoAvalability(todo);
      res.status(200).json({ message: 'Todo fetched.', todo });
    })
    .catch(err =>
    {
      err = errorHandler(err);
      next(err);
    });
}

exports.updateTodo = (req, res, next) =>
{
  const { todoId } = req.params;
  const { content } = req.body;

  User.findById(todoId)
    .then(todo =>
    {
      checkTodoAvalability(todo);
      checkAuthorization(todo, req.query.userId);

      todo.content = content;
      return todo.save();
    })
    .then(result =>
    {
      res.status(200).json({ message: 'Todo updated!', todo: result });
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
  User.findById(todoId)
    .then(todo =>
    {
      checkTodoAvalability(todo);
      checkAuthorization(todo, req.query.userId);

      // Check logged in user
      return User.findByIdAndRemove(todoId);
    })
    .then(() =>
    {
      return User._findById(req.query.userId);
    })
    .then(user =>
    {
      user.posts.pull(todoId);
      return user.save();
    })
    .then(() =>
    {
      res.status(200).json({ message: 'Deleted todo.' });
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
