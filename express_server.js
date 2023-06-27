const express = require("express");
const app = express();
const PORT = 8080;

//standart way to tell express to use ejs files
app.set("view engine", "ejs");




const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//when a user on a home page -> send Hello!
app.get("/", (req, res) => {
  res.send("Hello!");
});

//message in the terminal on a server side
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

//ADDING ROUTES
//Express application is set up with a route defined for the path "/urls.json".
//The res.json() function is provided by Express to send a JSON response to the client. It takes an object or an array as an argument and automatically converts it to JSON format. 
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// urls_index is the name or path of the template file to be rendered. It's a relative path to a specific template file "views/urls_index.ejs"
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//Route to render urls_show.ejs template
//The : in front of id indicates that id is a route parameter. This means that the value in this part of the url will be available in the req.params object.
//Inside the route handler, a new templateVars object is created. It contains two properties: id, which stores the value of req.params.id, and longURL, which retrieves the associated longURL from the urlDatabase using urlDatabase[req.params.id].
//The res.render() function is used to render the urls_show template. The first argument is the name of the template file to render, and the second argument is the templateVars object containing the data to be passed to the template for rendering. In this case, templateVars contains the id and longURL values.
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});


//sending html
//why do we need this page?
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

