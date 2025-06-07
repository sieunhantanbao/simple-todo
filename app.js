const express = require('express');
const path = require('path'); // Add this line
const app = express();
const todoRoutes = require('./routes/todo');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger');
const db = require('./db');
const pageRoutes = require('./routes/pages');

const expressLayouts = require('express-ejs-layouts');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(expressLayouts);
app.set('layout', 'layout');

app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.use('/api/todos', todoRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/', pageRoutes);



const PORT = process.env.PORT || 3000;


(async () => {
  try {
    await db.init(); // initialize DB and table
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  } catch (err) {
    console.error('App failed to start:', err);
    process.exit(1);
  }
})();
