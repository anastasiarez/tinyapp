const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

function generateRandomString() {
  const str = Math.random().toString(36).slice(7);
  return str;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//ADDING ROUTES

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const id = generateRandomString(); 
  const longURL = req.body.longURL; 
  urlDatabase[id] = longURL; 
  res.redirect(`/urls/${id}`);

  console.log(req.body); 
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id; 
  const longURL = urlDatabase[id]; 
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL not found");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id; // Get the id from the request parameter

  if (urlDatabase[id]) {
    delete urlDatabase[id]; // Remove the URL resource using the delete operator
    res.redirect("/urls"); // Redirect the client back to the urls_index page
  } else {
    res.status(404).send("URL not found"); // Return a 404 status if the id is not found in the urlDatabase
  }
});

//sending html
//why do we need this page?
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

