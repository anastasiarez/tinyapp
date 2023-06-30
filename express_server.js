//In Express.js, req.params and req.body are properties of the req object, which represents the HTTP request being handled by the server.
//req.body contains the parsed request body data sent by the client. 


const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
//const SALT_ROUNDS = 10;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//DATABASES

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "1a1a2a",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};


//SUPPORTING FUNCTIONS

function generateRandomString() {
  const str = Math.random().toString(36).slice(7);
  return str;
}

function getUserByEmail(email) {
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      return user;
    }
  }
  return null;
}


// ROUTES

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/", (req, res) => {
  res.redirect("/urls");
});


// when new URL submitted: retrieve the user object based on the user_id cookie and pass it to the template and access the user's information in the template.

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { user };
  res.render("urls_new", templateVars);
});


//main page with all urls per user
app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];
  const templateVars = {
    user: user,
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});


// render the "urls_show" to display the details of a specific URL identified by the id parameter.
//:id is short URL - "b2xVn2"

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  // It retrieves the id parameter from the request's URL. - /urls/b2xVn2
  const longURL = urlDatabase[id];
  const user = users[req.cookies.user_id];
  const templateVars = { id, longURL, user };
  res.render("urls_show", templateVars);
  //The template can access the values of id, longURL, and user and display the details of the URL.
});


// Create new URL - POST handles the request. It generates a unique ID, retrieves the "longURL" value from the request body, and stores it in the urlDatabase object. It redirects the client to the page displaying the details of the newly created URL.

app.post("/urls", (req, res) => {
  const id = generateRandomString();
  const longURL = req.body.longURL;
  if (longURL) {
    urlDatabase[id] = longURL;
    res.redirect(`/urls/${id}`);
    //redirects the client to the "/urls/:id" path, where ":id" is replaced with the generated ID. 
  } else {
    res.status(400).send("Please provide long URL");
  }
});


// /u/:id endpoint is designed to redirect the user to the long URL associated with the captured id

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL not found");
  }
});


// Delete id from the urls page / urlDatabase
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  if (urlDatabase[id]) {
    delete urlDatabase[id];
    res.redirect("/urls");
  } else {
    res.status(404).send("Failed to delete URL");
  }
});


// Edit the URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  if (newLongURL) {
    urlDatabase[id] = newLongURL;
    res.redirect("/urls");
  } else {
    res.status(400).send("Missing long URL");
  }
});

app.get("/login", (req, res) => {
  res.render("login")
});

//The code extracts the email and password from the request body obj
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (user && bcrypt.compareSync(password, user.password)) {

    //If a user object is found (user is truthy) and the provided password matches the stored password for that user (using bcrypt.compareSync), the code proceeds.

    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(401).send("Invalid email or password");
  }
});

////////////////////////////////////////////////////////////////////////////////
// const salt = bcrypt.genSaltSync(SALT_ROUNDS);
// const hash = bcrypt.hashSync(PASSWORD, salt);

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const user = req.cookies.user_id ? users[req.cookies.user_id] : null;

  //ternary operator: condition ? expression1 : expression2
  //The condition is evaluated. If the condition is truthy, the expression before the : is executed. If it's falsy, the expression after the : is executed. 

  //The condition is req.cookies.user_id, which checks if the user_id cookie exists and has a truthy value.
  // If the user_id cookie exists, users[req.cookies.user_id] is assigned to user, meaning the corresponding user object is retrieved from the users object.
  // If the user_id cookie does not exist or is falsy, null is assigned to user.

  const templateVars = { user };
  res.render("register", templateVars);
});



app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("Email and password are required.");
    return;
  }

  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      res.status(400).send("Email already registered.");
      return;
    }
  }

  const userId = generateRandomString();

  const newUser = {
    id: userId,
    email,
    password
  };

  users[userId] = newUser;
  res.cookie("user_id", userId);
  res.redirect("/urls");
});





//sending html

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});