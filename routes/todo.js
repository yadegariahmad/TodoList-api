const { Router } = require('express');
const todoController = require('../controllers/todo');
const isAuth = require('../util/is-auth');

const router = Router();

// GET /todo/todos
router.get('/todos', isAuth, todoController.getTodos);

// POST /todo/todo
router.post('/todo', isAuth, todoController.createTodo);

router.get('/todo/:todoId', isAuth, todoController.getTodo);

router.put('/todo/:todoId', todoController.updateTodo);

router.delete('/todo/:todoId', isAuth, todoController.deleteTodo);

module.exports = router;
