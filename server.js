const express = require('express');
const _ = require('lodash');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

mongoose.promise = global.promise;
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {ObjectID} = require('mongodb');

var app = express();
const port = process.env.PORT || 3000;

// mongoose.connect('mongodb://localhost:27017/TodoApp', {useNewUrlParser: true});
mongoose.connect('mongodb+srv://saurabh:12345@cluster0-3ygc1.mongodb.net/test?retryWrites=true&w=majority', {useNewUrlParser: true});

app.use(bodyParser.json());


app.post('/todos', (req, res) => {
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc) => {
        res.send(doc);
    }, (e) => {
        res.status(400).send(e);
    });

});


app.get('/todos', (req, res) => {
    Todo.find().then( (todos) => {
        res.send({todos});
    }, (e) => {
        res.status(400).send(e);
    });
});


app.get('/todos/:id', (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    Todo.findById(id).then( (todo) => {
        if(!todo){
            return res.status(404).send();
        }
        res.send(todo);
    }).catch( (e) => {
        res.s(400).send();
    });

});


app.delete('/todos/:id', (req, res) => {
    var id = req.params.id;
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }
    Todo.findByIdAndRemove(id).then( (todo) => {
        if(!todo){
            return res.status(404).send();
        }
        res.send(todo);
    }).catch( (e) => {
        res.status(400).send();
    });
});


app.patch('/todos/:id', (req, res) => {
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

    Todo.findByIdAndUpdate(id, { $set: body}, {new: true}).then( (todo) => {
        if(!todo){
            return res.status(404).send();
        }
        res.send({todo});
    }).catch( (e) => {
        res.status(400).send();
    });
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});



