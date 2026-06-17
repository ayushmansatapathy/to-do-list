require("dotenv").config();

const path = require("path");

const connectDB = require("./config/db");

const express = require("express");

const errorHandler = require("./middleware/errorHandler");

const app = express();

connectDB();

app.use(express.json());

app.use(express.static(
    path.join(__dirname, "public")
));

const taskRoutes =
    require("./routes/taskRoutes");

app.use("/tasks", taskRoutes);

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});

app.use(errorHandler);

const PORT =
    process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(
        `Server running on port ${PORT}`
    );

});