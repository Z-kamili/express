const helmet =  require('helmet');
const morgan =  require('morgan');
const Joi = require('joi');
const { application } = require('express');
const express = require('express');
const logger = require('./logger');
const app =  express();



// console.log(`NODE_ENV: ${process.env.NODE_ENV}`);


//Middlleware
app.use(express.json()); 
app.use(express.urlencoded({ extended:true }));// key = value & key = value
app.use(express.static('public'));
app.use(helmet());

if(app.get('env') === 'development') {

    app.use(morgan('tiny'));
    console.log('Morgan enabled...');

}

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
    res.send('Hello World!!!');
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

