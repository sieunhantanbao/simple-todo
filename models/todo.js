const db = require('../db');

async function getTodos() {
  const res = await db.query('SELECT * FROM todos ORDER BY id');
  return res.rows;
}

async function getTodo(id) {
  const res = await db.query('SELECT * FROM todos WHERE id = $1', [id]);
  return res.rows[0];
}

async function createTodo(title) {
  const res = await db.query('INSERT INTO todos (title) VALUES ($1) RETURNING *', [title]);
  return res.rows[0];
}

async function updateTodo(id, completed) {
  const res = await db.query('UPDATE todos SET completed = $1 WHERE id = $2 RETURNING *', [completed, id]);
  return res.rows[0];
}

async function deleteTodo(id) {
  await db.query('DELETE FROM todos WHERE id = $1', [id]);
}

module.exports = {
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo
};
