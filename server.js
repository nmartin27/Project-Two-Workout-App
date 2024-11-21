const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const mongoose = require('mongoose');
const methodOverride = require("method-override"); 
const path = require('path');

const app = express();
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('connected', ()=>{
    console.log(`${mongoose.connection.name}`);
});
    
const Workout = require('./models/workout.js');

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method")); 
app.use(express.static(path.join(__dirname, "public")))

//home page
app.get('/', async (req, res)=> {
    res.render('home.ejs')
})
//index page
app.get('/workouts', async (req, res) => {
    const allWorkouts = await Workout.find()
    res.render('workouts/index.ejs', {workouts: allWorkouts})
})

//create new 
app.get('/workouts/new',  async (req, res)=>{
    res.render('workouts/new.ejs')
})

//show page
app.get('/workouts/:workoutId', async (req, res)=>{
    const foundWorkout = await Workout.findById(req.params.workoutId)
    // const foundExercise = foundWorkout.exercises.id(exerciseId)
    await foundWorkout.save()
    res.render('workouts/show.ejs', {
        workout: foundWorkout,
        // exercise: foundExercise,
    })
}) 

//Add to sub-document exercises?
// app.post('/workouts/:workoutId', async (req, res) =>{
//     await Workout.create(req.body)
//        res.redirect('/workouts/show.ejs')
//     });

app.post('/workouts', async (req, res) =>{
if (req.body.isCompleted === 'on'){
    req.body.isCompleted = true; 
} else {
    req.body.isCompleted = false;
}
await Workout.create(req.body)
   res.redirect('/workouts')
});

// Delete
app.delete('/workouts/:workoutId', async (req, res) => {
    await Workout.findByIdAndDelete(req.params.workoutId)
    res.redirect('/workouts')
})

//Edit
app.get('/workouts/:workoutId/edit', async (req, res)=>{
    const foundWorkout = await Workout.findById(req.params.workoutId)
    res.render('workouts/edit.ejs', {
        workout: foundWorkout
    })
})

//Update
app.put('/workouts/:workoutId', async (req, res)=>{
    if (req.body.isCompleted === 'on'){
        req.body.isCompleted = true; 
    } else {
        req.body.isCompleted = false;
    } 
    await Workout.findByIdAndUpdate(req.params.workoutId, req.body)
    res.redirect(`/workouts/${req.params.workoutId}`)
})




app.listen(3003, () =>{
    console.log("Port 3003, sir!");
    
})