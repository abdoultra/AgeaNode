require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const eventRoutes = require("./routes/eventRoutes");
const cotisationRoutes = require("./routes/cotisationRoutes");

const app = express();
const port = 3000;

//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/cotisations", cotisationRoutes);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Connect to MongoDB
// Si vous n'avez pas le console.log, vérifiez d'installer MondoDB Community Server et de le lancer en local !
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
  });

app.listen(port, () => {
  console.log(`Server online at http://localhost:${port}`);
});
