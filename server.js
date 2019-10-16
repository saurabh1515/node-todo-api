const express = require('express');
const _ = require('lodash');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.promise = global.promise;
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {ObjectID} = require('mongodb');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT || 3000;

// mongoose.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true});
mongoose.connect('mongodb+srv://saurabh:12345@cluster0-3ygc1.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true});

app.use(bodyParser.json());

// POST a todo
app.post('/todos', authenticate, (req, res) => {
    var todo = new Todo({
        text: req.body.text,
        _creater: req.user._id
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });

});


// GET all todos
app.get('/todos', authenticate, (req, res) => {
    Todo.find({
        _creater: req.user._id
    }).then( (todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});


app.get('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    Todo.findOne({
        _id: id,
        _creater: req.user._id
    }).then( (todo) => {
        if(!todo){
            return res.status(404).send();
        }
        res.send(todo);
    }).catch( (e) => {
        res.s(400).send();
    });

});


app.delete('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    Todo.findOneAndRemove({
        _id: id,
        _creater: req.user._id
    }).then( (todo) => {
        if(!todo){
            return res.status(404).send();
        }
        res.send(todo);
    }).catch( (e) => {
        res.status(400).send();
    });
});


app.patch('/todos/:id', authenticate, (req, res) => {
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    }
    else{
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findOneAndUpdate({_id: id, _creater: req.user._id}, { $set: body}, {new: true}).then( (todo) => {
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo});
    }).catch( (e) => {
        res.status(400).send();
    });
});


app.post('/users', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    var user = new User(body);
    user.save().then( () => {
        return user.generateAuthToken();
    }).then( (token) => {
        res.header('x-auth', token).send(user);
    }).catch( (e) => {
        res.status(400).send(e);
    });
});


app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

// POST user login
app.post('/users/login', (req, res) => {
    var body = _.pick(req.body, ['email', 'password']);
    User.findByCredentials(body.email, body.password).then( (user) => {
        user.generateAuthToken().then((token) => {
            res.header('x-auth', token).send(user);
        })
    }).catch( (e) => {
        res.status(400).send();
    });
});


app.delete('/users/me/token', authenticate, (req, res) => {
    req.user.removeToken(req.token).then(() => {
      res.status(200).send();
    }, () => {
      res.status(400).send();
    });
  });

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});



