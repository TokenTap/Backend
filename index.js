const express = require('express');
require('dotenv').config();

const { auth } = require('./middlewares/auth');
const aptos = require('./services/aptos');

const app = express();
app.use(express.json());
app.use(require('cors')());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/login", aptos.loginUser);

app.get("/get-recipes", aptos.getAllRecipes);

app.post("/add-recipe", auth, aptos.addRecipe);

app.get("/get-recipe-by-id", aptos.getRecipeById);

app.get("/get-all-appreciations", aptos.getAllAppreciations);

app.post("/upvote-recipe", auth, aptos.upvoteRecipe);

app.listen(process.env.PORT || 8080, () => {
  console.log("Server is running on port 8080");
});