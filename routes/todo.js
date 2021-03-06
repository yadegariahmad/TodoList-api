const { Router } = require('express');
const todoController = require('../controllers/todo');
const isAuth = require('../util/is-auth');

const router = Router();

// GET /todo/todos
router.get('/getTodos', isAuth, todoController.getTodos);

// POST /todo/todo
router.post('/addTodo', isAuth, todoController.createTodo);

router.put('/toggleTodo/:todoId', isAuth, todoController.toggleTodo);

router.put('/updateTodo', todoController.updateTodo);

router.delete('/deleteTodo/:todoId', isAuth, todoController.deleteTodo);

module.exports = router;
