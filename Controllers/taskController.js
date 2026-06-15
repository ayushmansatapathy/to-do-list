const Task = require("../models/Task");

const getAllTasks = async (req, res) => {

    try {

        const tasks = await Task.find();

        res.json(tasks);

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }

};

const createTask = async (req, res) => {

    const { title } = req.body;

    if (!title || typeof title !== "string") {
        return res.status(400).json({
            message: "Valid title is required"
        });
    }

    const newTask = await Task.create({
        title
    });

    res.status(201).json(newTask);
};

const updateTask = async (req, res) => {

    const taskId = req.params.id;

    const task = await Task.findById(taskId);

    if (!task) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    task.completed = req.body.completed;

    await task.save();

    res.json(task);

};

const deleteTask = async (req, res) => {

    const taskId = req.params.id;

    const deletedTask = await Task.findByIdAndDelete(taskId);

    if (!deletedTask) {
        return res.status(404).json({
            message: "Task not found"
        });
    }

    res.json({
        message: "Task deleted successfully",
        task: deletedTask
    });

};

module.exports = {
    getAllTasks,
    createTask,
    updateTask,
    deleteTask
};