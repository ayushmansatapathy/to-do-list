require("dotenv").config();

const connectDB = require("./config/db");

const express = require("express");

connectDB();

const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(express.json());

const tasks = require("./data/tasks");

const taskRoutes = require("./routes/taskRoutes");

const PORT = process.env.PORT || 3000;

// Home Route
app.get("/", (req, res) => {
    res.send("Welcome to To-Do API");
});

// Mount Task Routes
app.use("/tasks", taskRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});