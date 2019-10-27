const express = require('express');
const { json } = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { connect } = require('mongoose');
const { corsWhitelist } = require('./util/misc');

const todoRoutes = require('./routes/todo');
const authRoutes = require('./routes/auth');

const app = express();

app.use(json()); // application/json
app.use(cors(corsWhitelist()));
app.use(helmet());
app.use(compression());

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
  { useNewUrlParser: true }
)
  .then(() =>
  {
    app.listen(process.env.PORT || 8080);
    console.log('Listening ...');
  })
  .catch(err => console.log(err));