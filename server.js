const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const path = require("path");

const app = express();
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on("connected", async () => {
  console.log(`${mongoose.connection.name}`);
  //   await runQueries();
});

const Workout = require("./models/workout.js");

app.use(express.urlencoded({ extended: false }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

//home page
app.get("/", async (req, res) => {
  res.render("home.ejs");
});
//Read index Workout page
app.get("/workouts", async (req, res) => {
  const allWorkouts = await Workout.find();
  res.render("workouts/index.ejs", { workouts: allWorkouts });
});

//create new page
app.get("/workouts/new", async (req, res) => {
  res.render("workouts/new.ejs");
});

//show page Workout
app.get("/workouts/:workoutId", async (req, res) => {
  const foundWorkout = await Workout.findById(req.params.workoutId);
  const exerciseId = req.params.exerciseId;
  const foundExercise = foundWorkout.exercises.id(exerciseId);
  // await foundWorkout.save()
  res.render("workouts/show.ejs", {
    workout: foundWorkout,
    exercise: foundExercise,
  });
});

//Find sub-document exercises
// const findExercise  = async (req, res) => {
//     const foundWorkout = await Workout.findById(req.params.workoutId)
//     const exerciseId = req.params.exerciseId;
//     const foundExercise = foundWorkout.exercises.id(exerciseId)
//     console.log('subdocument:', foundExercise);
//     res.render('workouts/show.ejs', {
//         exercise: foundExercise,
//     })
// }

//create exercise
const createExercise = async (workoutId, exerciseData) => {
  const foundWorkout = await Workout.findById(workoutId);

  foundWorkout.exercises.push(exerciseData);
  await foundWorkout.save();

  //   console.log('Modified workout:', foundWorkout);
  return foundWorkout;
};

//Add to sub-document exercises route
app.post("/workouts/:workoutId/exercise", async (req, res) => {
  const workoutId = req.params.workoutId;
  const exerciseData = {
    name: req.body.name,
    isCompleted: req.body.isCompleted === "on",
    reps: req.body.reps,
  };

  // console.log('workoutId from URL:', req.params.workoutId);

  const updatedWorkout = await createExercise(workoutId, exerciseData);
  res.redirect(`/workouts/${workoutId}`);
});

//Delete Exercise
const removeExercise = async (workoutId, exerciseId) => {
  const foundWorkout = await Workout.findById(workoutId);
  const foundExercise = foundWorkout.exercises.id(exerciseId);
  foundWorkout.exercises.pull(foundExercise);
  await foundWorkout.save();
};

// Delete exercise route
app.delete("/workouts/:workoutId/exercises/:exerciseId", async (req, res) => {
  const { workoutId, exerciseId } = req.params; //asked chat why exercise id was not passing
  await removeExercise(workoutId, exerciseId);
  res.redirect(`/workouts/${workoutId}`);
});

//Update Exercise
const updateExercise = async (workoutId, exerciseId, updatedData) => {
  const foundWorkout = await Workout.findById(workoutId);
  const foundExercise = foundWorkout.exercises.id(exerciseId);
  foundExercise.name = updatedData.name || foundExercise.name;
  foundExercise.isCompleted = updatedData.isCompleted;
  foundExercise.reps = updatedData.reps || foundExercise.reps;
  await foundWorkout.save();
};

//Update Exercise route
app.put("/workouts/:workoutId/exercises/:exerciseId", async (req, res) => {
   const { workoutId, exerciseId } = req.params;
   const updatedData = {
    name: req.body.name,
    isCompleted: req.body.isCompleted === "on",
    reps: req.body.reps,
  };
  await updateExercise(workoutId, exerciseId, updatedData);
  res.redirect(`/workouts/${req.params.workoutId}`);
});

// const runQueries = async () => {
//     console.log('Running q');
//     await createExercise();
// }

// create new workout
app.post("/workouts", async (req, res) => {
  if (req.body.isCompleted === "on") {
    req.body.isCompleted = true;
  } else {
    req.body.isCompleted = false;
  }
  await Workout.create(req.body);
  res.redirect("/workouts");
});

// Delete Workout
app.delete("/workouts/:workoutId", async (req, res) => {
  await Workout.findByIdAndDelete(req.params.workoutId);
  res.redirect("/workouts");
});

//Edit Workout
app.get("/workouts/:workoutId/edit", async (req, res) => {
  const foundWorkout = await Workout.findById(req.params.workoutId);
  res.render("workouts/edit.ejs", {
    workout: foundWorkout,
  });
});

//Update Workout
app.put("/workouts/:workoutId", async (req, res) => {
  if (req.body.isCompleted === "on") {
    req.body.isCompleted = true;
  } else {
    req.body.isCompleted = false;
  }
  await Workout.findByIdAndUpdate(req.params.workoutId, req.body);
  res.redirect(`/workouts/${req.params.workoutId}`);
});




app.listen(3003, () => {
  console.log("Port 3003, sir!");
});