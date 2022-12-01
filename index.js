const startupDebugger =  require('debug')('app:startup');
const dbDebugger =  require('debug')('app:db');
const config = require('config');
const helmet = require('helmet');
const morgan = require('morgan');
const Joi = require('joi');
const { application } = require('express');
const express = require('express');
const logger = require('./logger');
const app =  express();
const mongoose = require('mongoose');
let url = 'mongodb://127.0.0.1/playground';

//connexion to mongoDB
mongoose.connect(url)
        .then(() => console.log('connected to MongoDB...'))
        .catch(err => console.log('Could not connect to MongoDB...',err));






// schema 

const courseShema = new mongoose.Schema({

     name : {
        type:String,
        required:true,
        minlength:5,
        maxlength:5
     },
     category : {
       type:String,
       required:true,
       enum:['web','mobile','network'],
       lowercase:true,
       //upercase : true,
       trim:true,
     },
     author:String,
     tags : {
        type:Array,
        validate : {
            isAsync : true,
            validator : function(v,callback) {
                 setTimeout(() => {
                  // Do some async work.
                  const result = v && v.length > 0;
                 },4000);
            },
            message: 'A course should have at least one tag.'
        },
     },
     date:{type:Date,default:Date.now},
     isPublished:Boolean,
     price : {
        type:Number,
        required : () => {return this.isPublished;},
        min : 10,
        max : 200,
        get: v => Math.round(v),
        set: v => Math.round(v)
     },
});

   //Classes,objects
   //Course,nodeCourse

const Course = mongoose.model('Course',courseShema);

//configuration 
app.set('view engine','pug');
app.set('views','./views'); //default



// console.log(`NODE_ENV: ${process.env.NODE_ENV}`);


//Middlleware
app.use(express.json()); 
app.use(express.urlencoded({ extended:true })); // key = value & key = value
app.use(express.static('public'));
app.use(helmet());

//Configuration 
console.log('Application Name: ' + config.get('name'));
console.log('Mail Server: ' + config.get('mail.host'));


if(app.get('env') === 'development') {
    app.use(morgan('tiny'));
    startupDebugger('Morgan enabled...');
}

// Db work...
dbDebugger('Connected to the database...');

app.use(logger);




//Middlleware
app.use(function(req,res,next) {

    console.log('Authenticating...');
    next();

});

const courses = [
    {id:1,name:'course1'},
    {id:2,name:'course2'},
    {id:3,name:'course3'},
];

app.get('/',(req,res) => {
    res.render('index',{title:'My Express App',message:'Hello'});
});

app.get('/api/courses/:id',(req,res) => {

 const  course = courses.find(c => c.id === parseInt(req.params.id));
 if(!course) return res.status(404).send('The course with the given ID was not found');
 res.send(course);

});

app.get('/api/courses',(req,res) => {

    res.send(courses);

});

app.post('/api/courses',(req,res) => {

    const result = ValidateCourse(req.body);
    const {error} = ValidateCourse(req.body);

    if(error) return  res.status(400).send(result.error.details[0].message);

const course = {
    
    id:courses.length + 1,
    name:req.body.name

};

    courses.push(course);

    res.send(course);

});

app.put('/api/courses/:id',(req,res) => {

    // Look up the course
    // If not existing, return 404

    const  course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course) return res.status(404).send('The course with the given ID was not found');

    // Validate
    // If invalid, return 400 - Bad request

    const result = ValidateCourse(req.body);
    const {error} = ValidateCourse(req.body);

    if(error) return res.status(400).send(result.error.details[0].message);

    course.name = req.body.name;
    res.send(course);
    //Return the updated course


});

app.delete('/api/courses/:id',(req,res) => {

    //Look up the course
    //Not existing, return 404
    
    const  course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course) return res.status(404).send('The course with the given ID was not found');

    //Delete 
    const index = courses.indexOf(course);
    courses.splice(index,1);
    res.send(course);

    //Return the same course

})

function ValidateCourse(course) {

    //validation
    const schema = {
        name: Joi.string().min(3).required()
    };

    return  Joi.validate(course,schema);

}

const port = process.env.PORT || 3000;

app.listen(port,() => console.log(`Listening on port ${port}...`));

// app.post()
// app.put()
// app.delete()

