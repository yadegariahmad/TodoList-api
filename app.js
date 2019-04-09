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
  'mongodb+srv://yadegariahmad:Seyah141374@cluster0-ue3bz.mongodb.net/test?retryWrites=true',
  { useNewUrlParser: true })
  .then(() =>
  {
    app.listen(8080);
    console.log('listening ...');
  })
  .catch(err => console.log(err));



//"C:\Program Files\MongoDB\Server\4.0\bin\mongod.exe" --dbpath="c:\data\db"