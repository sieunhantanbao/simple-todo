const express = require('express');
const router = express.Router();
const Todo = require('../models/todo');

// List todos
router.get('/', async (req, res) => {
  const todos = await Todo.getTodos();
  res.render('index', { todos });
});

// Show form to create a new todo
router.get('/todos/new', (req, res) => {
  res.render('new');
});

// View one todo
router.get('/todos/:id', async (req, res) => {
  const todo = await Todo.getTodo(req.params.id);
  if (!todo) return res.status(404).send('Todo not found');
  res.render('show', { todo });
});

// Edit form
router.get('/todos/:id/edit', async (req, res) => {
  const todo = await Todo.getTodo(req.params.id);
  if (!todo) return res.status(404).send('Todo not found');
  res.render('edit', { todo });
});

// Submit update
router.post('/todos/:id', async (req, res) => {
  const completed = req.body.completed === 'on';
  await Todo.updateTodo(req.params.id, completed);
  res.redirect('/');
});

// Delete todo
router.post('/todos/:id/delete', async (req, res) => {
  await Todo.deleteTodo(req.params.id);
  res.redirect('/');
});



// Handle form submission
router.post('/todos', async (req, res) => {
  const title = req.body.title?.trim();
  if (!title) return res.status(400).send('Title is required');
  await Todo.createTodo(title);
  res.redirect('/');
});


module.exports = router;
