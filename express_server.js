//In Express.js, req.params and req.body are properties of the req object, which represents the HTTP request being handled by the server.
//req.body contains the parsed request body data sent by the client. 
//templateVars is commonly used as a convention to indicate that the object contains variables specifically intended for the template rendering process.
//ternary operator: condition ? expression1 : expression2


const express = require("express");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080;
const SALT_ROUNDS = 10;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


//DATABASES

const urlDatabase = {
  "amsmwl": "https://savelife.in.ua/en/",
  "usa4ka": "https://ukraine.ua/invest-trade/digitalization/"
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


//Home Page
app.get("/", (req, res) => {
  res.redirect("/register");
});


//User Registration

app.get("/register", (req, res) => {
  const user = req.cookies.user_id ? users[req.cookies.user_id] : null;
  const templateVars = { user };
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
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
      res.status(400).send("Email is already registered.");
      return;
    }
  }
  const userId = generateRandomString();

  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  const hash = bcrypt.hashSync(password, salt);

  const newUser = {
    id: userId,
    email,
    password: hash
  };

  users[userId] = newUser;
  res.cookie("user_id", userId);
  res.redirect("/urls/new");
});


//Login & Logout

//code checks if user's info is stored in cookies and then redirects to the appropriate pages
app.get("/login", (req, res) => {
  const user = req.cookies.user_id ? users[req.cookies.user_id] : null;
  if (user) {
    res.redirect("/urls");
  } else {
    res.render("login", { user });
  }
});

//During loging process the code extracts the email and password from the request body obj, checks if user exists in the getUserByEmail database
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = getUserByEmail(email);
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {

      //If a user object is found (user is truthy) and the provided password matches the stored password for that user (using bcrypt.compareSync), the code proceeds.

      res.cookie("user_id", user.id);
      res.redirect("/urls");
    } else {
      res.status(403).send("Incorrect email or password");
    }
  }
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});


// New URL page: retrieve the user object based on the user_id cookie and pass it to the template and access the user's information in the template. If user's info is not found in cookies they redirected to login page

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { user };
  if (!user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});


//Show main page with all urls per user
app.get("/urls", (req, res) => {
  const userID = req.cookies.user_id;
  const user = users[userID];

  if (!user) {
    const error = "You must be logged in to shorten URLs."; //this is not printed to the user. If they are not loged in they cannot access /urls at all. They stay on login page.*******************************************
    res.status(401).render("login", { user: null, error});
  } else {
    const templateVars = {
      user: user,
      urls: urlDatabase
    };
    res.render("urls_index", templateVars);
  }
});


// render the "urls_show" to display the details of a specific URL identified by the id parameter.
//:id is short URL - "b2xVn2"

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  // It retrieves the id parameter from the request's URL. - /urls/b2xVn2
  const longURL = urlDatabase[id];
  const user = users[req.cookies.user_id];
  if (!user) {
    res.redirect("/login");
  } else {
    const templateVars = { id, longURL, user };
    res.render("urls_show", templateVars);
  }
});


// Create new URL: It generates a unique ID, retrieves the "longURL" value from the request body, and stores it in the urlDatabase object. It redirects the client to the page displaying the details of the newly created URL.

app.post("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  if (!user) {
    res.status(401).send("You must be logged in to shorten URLs.");//this is not printed to the user. If they are not loged in they cannot access /urls at all. They stay on login page.*******************************************
  } else {
    const id = generateRandomString();
    const longURL = req.body.longURL;
    if (longURL) {
      urlDatabase[id] = longURL;
      res.redirect(`/urls/${id}`);
      //redirects the client to the "/urls/:id" path, where ":id" is replaced with the generated ID. 
    } else {
      res.status(400).send("Please provide long URL");
    }
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


// Delete id from the urls page (urlDatabase)

//If they are not loged they cannot access /urls at all. They stay on login page. We want the site visitor to see My URLs page but not be able to delete or edit*******************************************
app.post("/urls/:id/delete", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { user };
  if (!templateVars.user) {
    res.status(401).send("You must be logged in order to delete URLs.");
  } else {
    const id = req.params.id;
    if (urlDatabase[id]) {
      delete urlDatabase[id];
      res.redirect("/urls");
    } else {
      res.status(404).send("Failed to delete URL");
    }
  }
});


// Edit the URL

//If they are not loged they cannot access /urls at all. They stay on login page. We want the site visitor to see My URLs page but not be able to delete or edit*******************************************
app.post("/urls/:id", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { user };
  if (!templateVars.user) {
    res.status(401).send("You must be logged in order to delete URLs.");
  } else {
    const id = req.params.id;
    const newLongURL = req.body.longURL;
    if (newLongURL) {
      urlDatabase[id] = newLongURL;
      res.redirect("/urls");
    } else {
      res.status(400).send("Missing long URL");
    }
  }
});

