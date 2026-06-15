const express = require("express");

const router = express.Router();

const tasks = require("../data/tasks");

const {
    getAllTasks,
    createTask,
    updateTask,
    deleteTask
} = require("../controllers/taskController");

router.get("/", getAllTasks);

// CREATE task
router.post("/", createTask);

// UPDATE task
router.put("/:id", updateTask);

// DELETE task
router.delete("/:id", deleteTask);


module.exports = router;