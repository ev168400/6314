/**
 * This builds on the webServer of previous projects in that it exports the
 * current directory via webserver listing on a hard code (see portno below)
 * port. It also establishes a connection to the MongoDB named 'project6'.
 *
 * To start the webserver run the command:
 *    node webServer.js
 *
 * Note that anyone able to connect to localhost:portNo will be able to fetch
 * any file accessible to the current user in the current directory or any of
 * its children.
 *
 * This webServer exports the following URLs:
 * /            - Returns a text status message. Good for testing web server
 *                running.
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns the population counts of the project6 collections in the
 *                database. Format is a JSON object with properties being the
 *                collection name and the values being the counts.
 *
 * The following URLs need to be changed to fetch there reply values from the
 * database:
 * /user/list         - Returns an array containing all the User objects from
 *                      the database (JSON format).
 * /user/:id          - Returns the User object with the _id of id (JSON
 *                      format).
 * /photosOfUser/:id  - Returns an array with all the photos of the User (id).
 *                      Each photo should have all the Comments on the Photo
 *                      (JSON format).
 */

const mongoose = require("mongoose");
mongoose.Promise = require("bluebird");

// const async = require("async");

const express = require("express");
const app = express();

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");

//needed for project 7
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
app.use(session({secret: "secretKey", resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
//const models = require("./modelData/photoApp.js").models;
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));

app.get("/", function (request, response) {
  response.send("Simple web server of files from " + __dirname);
});

/**
 * Use express to handle argument passing in the URL. This .get will cause
 * express to accept URLs with /test/<something> and return the something in
 * request.params.p1.
 * 
 * If implement the get as follows:
 * /test        - Returns the SchemaInfo object of the database in JSON format.
 *                This is good for testing connectivity with MongoDB.
 * /test/info   - Same as /test.
 * /test/counts - Returns an object with the counts of the different collections
 *                in JSON format.
 */
app.get("/test/:p1", async function (request, response) {
  // Express parses the ":p1" from the URL and returns it in the request.params
  // objects.
  console.log("/test called with param1 = ", request.params.p1);

  const param = request.params.p1 || "info";

  if (param === "info") {
    // Fetch the SchemaInfo. There should only one of them. The query of {} will
    // match it.
    try{

      const info = await SchemaInfo.find({});
      if (info.length === 0) {
            // No SchemaInfo found - return 500 error
            return response.status(500).send("Missing SchemaInfo");
      }
      console.log("SchemaInfo", info[0]);
      return response.json(info[0]); // Use `json()` to send JSON responses
    } catch(err){
      // Handle any errors that occurred during the query
      console.error("Error in /test/info:", err);
      return response.status(500).json(err); // Send the error as JSON
    }

  } else if (param === "counts") {
   // If the request parameter is "counts", we need to return the counts of all collections.
// To achieve this, we perform asynchronous calls to each collection using `Promise.all`.
// We store the collections in an array and use `Promise.all` to execute each `.countDocuments()` query concurrently.
   
    
const collections = [
  { name: "user", collection: User },
  { name: "photo", collection: Photo },
  { name: "schemaInfo", collection: SchemaInfo },
];

try {
  await Promise.all(
    collections.map(async (col) => {
      col.count = await col.collection.countDocuments({});
      return col;
    })
  );

  const obj = {};
  for (let i = 0; i < collections.length; i++) {
    obj[collections[i].name] = collections[i].count;
  }
  return response.end(JSON.stringify(obj));
} catch (err) {
  return response.status(500).send(JSON.stringify(err));
}
  } else {
    // If we know understand the parameter we return a (Bad Parameter) (400)
    // status.
    return response.status(400).send("Bad param " + param);
  }
});

/**
 * URL /user/list - Returns all the User objects.
 */
app.get("/user/list", async function (request, response) {
  try {
    //get list of users
    const users = await User.find({}, '_id first_name last_name');
    return response.status(200).json(users); //return users
  }
  catch (err) {
    return response.status(500).send(JSON.stringify(err)); //return error
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", async function (request, response) {
  const id = request.params.id; //get id
  
  try {
    //get user with id
    const user = await User.findById(id, '_id first_name last_name location description occupation');
    
    if (!user) { //if no user found
      console.log("User with _id:" + id + " not found.");
      return response.status(400).json("Not found"); //return error
    } else {
      return response.status(200).json(user); //return user details
    }
  }
  catch (err) {
    return response.status(400).send(JSON.stringify(err)); //return error
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", async function (request, response) {
  const id = request.params.id; //get id
  
  try {
    //get photos for user with id
    const photos = await Photo
      .find({ user_id: id }, '_id user_id comments file_name date_time')
      .populate({ //get additional data for comment
        path: 'comments.user_id',
        model: User,
        select: '_id first_name last_name'
      });
    
    if (!photos) { //if no photos found
      console.log("Photos for _id:" + id + " not found.");
      return response.status(400).json("Not found"); //return error
    }

    //format photos information
    const photosFinal = photos.map(photo => ({
      _id: photo._id,
      user_id: photo.user_id,
      comments: photo.comments.map(comment => ({ //format comment information
        comment: comment.comment,
        date_time: comment.date_time,
        _id: comment._id,
        user: { //format user information
          _id: comment.user_id._id,
          first_name: comment.user_id.first_name,
          last_name: comment.user_id.last_name
        }
      })),
      file_name: photo.file_name,
      date_time: photo.date_time
    }));

    return response.status(200).json(photosFinal); //return photos and comments
  }
  catch (err) {
    return response.status(400).send(JSON.stringify(err)); //return error
  }
});

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}))

app.use((req, res, next) => {
  if (!req.session.user && req.path !== '/admin/login'){
    req.session.redirectTo = req.url;
    return res.redirect('/admin/login')
  }
})

// middleware to test if authenticated
function isAuthenticated (req, res, next) {
  if (req.session.user) next()
  else next('route')
}

app.get('/', isAuthenticated, function (req, res) {
  // this is only called when there is an authentication user due to isAuthenticated
  res.send('hello, ' + (req.session.user) + '! ' +
    ' <a href="/logout">Logout</a>')
})

app.get('/', function (req, res) {
  res.send('Welcome to login demo... '  +
    ' <a href="/admin/login">Login</a>')
  // res.redirect('/login')
})

app.get('/admin/login', function (req, res) {
  res.send('<form action="/admin/login" method="post">' +
    'Username: <input name="user"><br>' +
    'Password: <input name="pass" type="password"><br>' +
    '<input type="submit" text="Login"></form>')
})

app.post('/admin/login', express.urlencoded({ extended: false }), function (req, res) {
  // login logic to validate req.body.user and req.body.pass
  // would be implemented here. for this example any combo works

  // regenerate the session, which is good practice to help
  // guard against forms of session fixation
  req.session.regenerate(function (err) {
    if (err) next(err)
  
    // store user information in session, typically a user id
    req.session.user = req.body.user

    // save the session before redirection to ensure page
    // load does not happen before session is saved
    req.session.save(function (err) {
      if (err) return next(err)

      res.redirect(req.session.redirectTo)
    })
  })
})

app.get('/logout', function (req, res, next) {
  // logout logic

  // clear the user from the session object and save.
  // this will ensure that re-using the old session id
  // does not have a logged in user
  req.session.user = null
  req.session.save(function (err) {
    if (err) next(err)

    // regenerate the session, which is good practice to help
    // guard against forms of session fixation
    req.session.regenerate(function (err) {
      if (err) next(err)
      res.redirect('/admin/logout')
    })
  })
})

/**
 * URL /admin/login - Description needed here
 *
app.post("/admin/login", async function (request, response) {
  console.log("Login page");
  return;
});*/

/**
 * URL /admin/logout - Description needed here
 *
app.post("/admin/logout", async function (request, response) {
  console.log("Logout page");
  return;
});*/

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
