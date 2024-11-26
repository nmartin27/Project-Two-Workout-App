const mongoose = require('mongoose');

const excerciseSchema = new mongoose.Schema ({
    name: String,
    isCompleted: Boolean,
    reps: String,
    weights: { type: Number, default: 0, min: 0 },
});

const workoutSchema = new mongoose.Schema({
    name: String,
    isCompleted: Boolean,
    duration: { type: Number, default: 0, min: 0 }, //chat advice: Default to 0 and ensure non-negative values
    exercises: [excerciseSchema],
});

const Workout = mongoose.model('Workout', workoutSchema);

module.exports = Workout