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
    name: {
       type:String,
       required:true,
       minlength:5,
       maxlength:255
    },
    // category : {
    //   type:String,
    //   required:true,
    //   enum:['web','mobile','network'],
    //   lowercase:true,
    //   trim:true,
    // },
    // author:String,
    // tags:{
    //     type:Array,
    //     validate: {
    //        isAsync : true,
    //        validator : function(v,callback) {
    //          setTimeout(() => {
    //          const result = v && v.length > 0;
    //          }, 4000);
    //        },
    //        message: 'A course should have at least one tag.'
    //     },
    // },
    // date:{type:Date,default:Date.now},
    // isPublished:Boolean,
    // price : {
    //    type : Number,
    //    required : () =>  { return this.isPublished; },
    //    min : 10,
    //    max : 200,
    //    get: v => Math.round(v),
    //    set: v => Math.round(v)
    // },
});


const Course = mongoose.model('Course',courseShema);


//configuration 
// app.set('view engine','pug');
// app.set('views','./views'); 



// console.log(`NODE_ENV: ${process.env.NODE_ENV}`);


//Middlleware
// app.use(express.json()); 
// app.use(express.urlencoded({ extended:true })); 
// app.use(express.static('public'));
// app.use(helmet());

//Configuration 
// console.log('Application Name: ' + config.get('name'));
// console.log('Mail Server: ' + config.get('mail.host'));


// if(app.get('env') === 'development') {
//     app.use(morgan('tiny'));
//     startupDebugger('Morgan enabled...');
// }

// Db work...
// dbDebugger('Connected to the database...');

// app.use(logger);




//Middlleware
// app.use(function(req,res,next) {

//     console.log('Authenticating...');
//     next();

// });

// const courses = [
//     {id:1,name:'course1'},
//     {id:2,name:'course2'},
//     {id:3,name:'course3'},
// ];


//create courses 

async function createCourse(params) {

     const course = new Course({
        name: params.body.name,
        // category: params.body.category,
        // author:params.body.author,
        tags:['backend','frontend'],
        isPublished:true
     });

     try 
     {
         const result = await course.save();
         return result;
     }
     catch (ex) 
     {
         for(field in ex.errors) 
                console.log(ex.errors[field]);
     }

}

async function getCourses() {
    const courses = await Course.find();
       return courses;
}

async function getCoursesById(params) {
    const courses = await Course.find({id:params});
    return courses;
}

// getCourses();



async function updateCourse(id,req) {

   const course = await Course.findByIdAndUpdate(id,{

        $set : {
            name: req.body.name,
            category: req.body.category,
            author:req.body.author,
            tags:['backend','frontend'],
            isPublished:true
        }

   });

   return course; 

}


async function removeCourse(id) {

    const result = await Course.findByIdAndRemove(id);
    return result;

}

app.get('/',async (req,res) => {
      const courses = await getCourses();
      console.log(courses);
      res.send(courses);
});

app.get('/api/courses/:id',async (req,res) => {

 const course = await getCoursesById(req.params.id);
 if(!course) return res.status(404).send('The course with the given ID was not found');
 res.send(course);

});

app.get('/api/courses',(req,res) => {

    res.send(courses);

});

app.post('/api/courses',async (req,res) => {

    const {error} = ValidateCourse(req.body);

    if(error) return res.status(400).send(error.details[0].message);

    let course =  await createCourse(req);

    res.send(course);

});

app.put('/api/courses/:id',async (req,res) => {

    // Look up the course
    // If not existing, return 404

    const {error} = ValidateCourse(req.body);

    if(error) return res.status(400).send(error.details[0].message);
    
    const course = await Course.findByIdAndUpdate(req.params.id,{name:req.body.name},{
        new : true
    });

    if(!course) return res.status(404).send('error in update courses');

    res.send(course);

    //Return the updated course

});



app.delete('/api/courses/:id',(req,res) => {

    const  course = courses.find(c => c.id === parseInt(req.params.id));
    if(!course) return res.status(404).send('The course with the given ID was not found');

    //Delete 
    const index = courses.indexOf(course);
    courses.splice(index,1);
    res.send(course);

    //Return the same course

});




function ValidateCourse(course) 
{

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



