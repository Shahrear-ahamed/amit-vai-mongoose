import express from "express";
import mongoose from "mongoose";
import User from "./user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
const port = 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/register", async (req, res) => {
  const userData = req.body;

  const result = await User.create(userData);

  res.send(result);
});

app.post("/login", async (req, res) => {
  const loginData = req.body;

  const isExist = await User.findOne({ email: loginData.email });

  if (!isExist) {
    return res.status(400).send("Email is not found");
  }

  const isMatch = await bcrypt.compare(loginData?.password, isExist?.password);

  if (!isMatch) {
    return res.status(400).send("Password is not correct");
  }

  const token = await jwt.sign(
    {
      email: isExist.email,
    },
    "amarsecretkey",
    { expiresIn: "1d" }
  );

  res.status(200).json({ token });
});

app.get("/users", async (req, res) => {
  const token = req.headers?.authorization.split(" ")[1];

  let decoded = null;

  try {
    decoded = jwt.verify(token, "amarsecretkey");
  } catch (err) {
    res.status(400).json({ error: "Token is not valid" });
  }

  const allUsers = await User.find();

  res.status(200).json({ allUsers });
});

mongoose
  .connect(
    "mongodb+srv://shahrear:shahrear@cluster0.hiarrys.mongodb.net/test?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
