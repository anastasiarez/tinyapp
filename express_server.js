const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

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

app.get("/urls.json", (req, res) => { //adding routes
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => { //adding routes
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars); // urls_index is the name or path of the template file to be rendered. It could be a relative path to a specific template file, such as "views/urls_index.ejs", or simply the name of the template file
});

app.get("/hello", (req, res) => { //sending html
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});