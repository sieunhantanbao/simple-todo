const express = require('express');
const router = express.Router();
const Todo = require('../models/todo');

/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: Get all todos
 *     responses:
 *       200:
 *         description: A list of todos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 */
router.get('/', async (req, res) => {
  const todos = await Todo.getTodos();
  res.json(todos);
});

/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: Get a single todo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: A single todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: Todo not found
 */
router.get('/:id', async (req, res) => {
  const todo = await Todo.getTodo(req.params.id);
  if (!todo) return res.status(404).send('Not found');
  res.json(todo);
});

/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: Create a new todo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Buy milk"
 *     responses:
 *       201:
 *         description: Created todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 */
router.post('/', async (req, res) => {
  const todo = await Todo.createTodo(req.body.title);
  res.status(201).json(todo);
});

/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: Update a todo's completion status
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               completed:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Updated todo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 */
router.put('/:id', async (req, res) => {
  const todo = await Todo.updateTodo(req.params.id, req.body.completed);
  res.json(todo);
});

/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: Delete a todo
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Todo deleted
 */
router.delete('/:id', async (req, res) => {
  await Todo.deleteTodo(req.params.id);
  res.status(204).send();
});

module.exports = router;
