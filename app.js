var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var ObjectId = mongojs.ObjectId;

//var db = mongojs(connectionString, [collections])
/*var db = mongojs('mongodb://admin:lc101@test-shard-00-00-ezp0q.mongodb.net:27017,test-shard-00-01-ezp0q.mongodb.net:27017,test-shard-00-02-ezp0q.mongodb.net:27017/test?ssl=true&replicaSet=Test-shard-0&authSource=admin&retryWrites=true', ['customerapp']);
*/

var db = mongojs('mongodb://admin:lc101@test-shard-00-00-ezp0q.mongodb.net:27017,test-shard-00-01-ezp0q.mongodb.net:27017,test-shard-00-02-ezp0q.mongodb.net:27017/customerapp?ssl=true&replicaSet=Test-shard-0&authSource=admin&retryWrites=true');

var mycollection = db.collection('users')



/*const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:<lc101>@test-ezp0q.mongodb.net/test?retryWrites=true";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("users");
  // perform actions on the collection object
  client.close();
});
*/


var app = express();

// The order of this funcion is very important as a middleware
/*
var logger = function(req,res,next){
  console.log('Logging...');
  next();
}

app.use(logger);
*/

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


// Body Parser Middelware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));



// Middelware for static folder

// Set Static Path
app.use(express.static(path.join(__dirname, 'public')));

// Global Vars
app.use(function(req, res, next){
  res.locals.errors = null;
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
    var namespace = param.split('.'),
    root = namespace.shift(),
    formParam = root;

    while(namespace.length){
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param: formParam,
      msg: msg,
      value: value
    };
  }
}));



var users = [
  {
    id: 1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'johndoe@gmail.com'
  },
  {
    id: 2,
    first_name: 'Bob',
    last_name: 'Smith',
    email: 'bobsmith@gmail.com'
  },
  {
    id: 3,
    first_name: 'Jill',
    last_name: 'Jackson',
    email: 'jjackson@gmail.com'
  }
]


// Object examples
var people = [{
  name: 'Jeff',
  age: 30
},
{
  name: 'Sara',
  age: 22
},
{
  name: 'Bill',
  age: 40
}]

var person = {
  name: 'Jeff',
  age: 30
}


//********** INDEX **********//
app.get('/',function(req,res){
  // Responses Examples
  //res.send('Hello');
  //res.json(person);
  //res.json(people);
  db.getCollectionNames(function (err, coll){
    //console.log(coll);
  });

  //db.mycollection.find(function (err, docs){
  db.users.find(function (err, docs){
    //console.log(docs);
    res.render('index',{
      title: 'Customers',
      //users: users
      users: docs
    });
  });
});


//**********  ADD USER **********//
app.post('/users/add', function(req,res){
  //console.log('FORM SUBMITTED')
  //console.log(req.body.first_name);
  
  req.checkBody('first_name', 'First Name is Required').notEmpty();
  req.checkBody('last_name', 'Last Name is Required').notEmpty();
  req.checkBody('email', 'Email is Required').notEmpty();
  
  var errors = req.validationErrors();

  if(errors){
    res.render('index',{
      title: 'Customers',
      users: users,
      errors : errors
    });
    console.log('ERRORS')
  } else{
    var newUser = { 
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
    }

    db.users.insert(newUser, function(err, result){
      if(err){
        console.log(err);
      }
      res.redirect('/');
    });
    console.log('SUCCESS')        
  }
  console.log(newUser);
});

//**********  DELETE USER **********//
app.delete('/users/delete/:id', function(req, res){
  console.log(req.params.id);
  db.users.remove({_id: ObjectId(req.params.id)},function(err, result){
    if(err){
      console.log(err);
    }
    res.redirect('/');
  });
});


const PORT = process.env.PORT || 3000;

//**********  RUN APP **********//
app.listen(PORT, function( ){
  console.log('Server Started on Port 3000...')
})

