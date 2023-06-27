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


app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});


//sending html
//why do we need this page?
app.get("/hello", (req, res) => { 
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

