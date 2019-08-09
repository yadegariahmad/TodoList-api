const express = require('express');
const { json } = require('body-parser');
const cors = require('cors');
const { connect } = require('mongoose');
const todoRoutes = require('./routes/todo');
const authRoutes = require('./routes/auth');

const app = express();

app.use(json()); // application/json
app.use(cors());

app.use('/todo', todoRoutes);
app.use('/auth', authRoutes);

app.use((error, _req, res) =>
{
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message: message, data: data });
});

connect(
  `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-ue3bz.mongodb.net/Todo-app?retryWrites=true`,
  // { useNewUrlParser: true }
)
  .then(() =>
  {
    app.listen(process.env.PORT || 8080);
    console.log('listening ...');
  })
  .catch(err => console.log(err));