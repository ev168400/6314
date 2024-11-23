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

//Express Middleware
const session = require("express-session");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");

// Load the Mongoose schema for User, Photo, and SchemaInfo
const User = require("./schema/user.js");
const Photo = require("./schema/photo.js");
const SchemaInfo = require("./schema/schemaInfo.js");


const processFormBody = multer({storage: multer.memoryStorage()}).single('uploadedphoto');
app.use(session({secret: "secretKey", resave: false, saveUninitialized: false}));
app.use(bodyParser.json());

// XXX - Your submission should work without this line. Comment out or delete
// this line for tests and before submission!
mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1/project6", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// We have the express static module
// (http://expressjs.com/en/starter/static-files.html) do all the work for us.
app.use(express.static(__dirname));



app.use((request, response, next) => {
  if (request.path === '/admin/login' || request.path === '/admin/logout' || request.path === '/user') {
    next();
  } else if (request.session.user) {
    next();
  } else {
    response.status(401).json({ error: 'Unauthorized' });
  }
});


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
app.get("/test/:p1",  async function (request, response) {
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
  try{
    var userList = await User.find({}, {_id:1, first_name:1, last_name:1});
    return response.status(200).send(userList);
  }catch(err){
    return response.status(500).send("Error fetching user list");
  }
});

/**
 * URL /user/:id - Returns the information for User (id).
 */
app.get("/user/:id", async function (request, response) {
  const id = request.params.id;
  try{
    var userDetail = await User.findById(id, '_id first_name last_name location description occupation').lean();
    return response.status(200).send(userDetail);
  }catch(err){
    console.log("User with _id:" + id + " not found.");
    return response.status(400).send("User with _id:" + id + " not found.");
  }
});

/**
 * URL /photosOfUser/:id - Returns the Photos for User (id).
 */
app.get("/photosOfUser/:id", async function (request, response) {
  const id = request.params.id;
  try{
    var userPhotos;
    userPhotos = await Photo.find({user_id: id}, {_id:1, user_id:1, comments:1, file_name:1, date_time:1}).lean();
    await Promise.all(
        userPhotos.map(async (photo) => {
          await Promise.all(
            photo.comments.map(async (comment) =>{
              comment.user = await User.findOne({_id: comment.user_id.toString()}, {_id:1, first_name:1, last_name:1}).lean();
              delete comment.user_id;
            })
          );
      })
    );
    return response.status(200).send(userPhotos);
  }catch(err){
    console.log("Photos for user with _id:" + id + " were not found.");
    return response.status(400).send("Photos for user with _id:" + id + " were not found.");
  }
});


app.post('/admin/login', async (request, response) => {
  const { login_name, password } = request.body;
  var invalid = "User does not exist";
  var user = null;
  var userlist;
  try {
    userlist = await User.find({}, {_id:1, first_name:1, last_name:1, login_name:1, password:1});
  } catch (err) {
    console.error(err);
    response.status(500).json({ error: 'Server error retreiving login details' });
  }
  for(const person of userlist){
    if(person.login_name === login_name && person.password === password){
      user = person;
    }else if(person.login_name === login_name){
      invalid = `Password does not match for user: ${login_name}`;
    }
  }
  if(user === null){
      return response.status(400).json({ error: invalid });
  }
  
  request.session.user = user;
  request.session.save();
  return response.json({ _id: user._id, first_name: user.first_name, last_name: user.last_name });
});

app.post('/admin/logout', (request, response) => {
  if(!request.session.user){
    return response.status(400).json({ error: 'Nobody is logged in' });
  }
  try {
    request.session.user = null;
    request.session.destroy();
    return response.redirect('/');
  } catch (err) {
    console.error('Unexpected error:', err);
    return response.status(500).json({ error: 'Server error' }); 
  }
});

app.post('/user', async (request, response) => {
  const { login_name, password , first_name, last_name, location , occupation , description } = request.body;
  var user = null;
  var userlist;
  const requiredFields = {
    Username: login_name,
    Password: password,
    First_Name: first_name,
    Last_Name: last_name
  };
  
  const emptyFields = [];
  
  for (const field in requiredFields) {
    if (requiredFields[field] === "") {
      emptyFields.push(field);
    }
  }
  
  if (emptyFields.length > 0) {
    return response.status(400).json({ error: `Please fill in the following fields: ${emptyFields.join(', ')}` });
  }
  try {
    userlist = await User.find({}, {_id:1, first_name:1, last_name:1, login_name:1, password:1});
  } catch (err) {
    console.error(err);
    response.status(500).json({ error: 'Server error retreiving login details' });
  }
  for(const person of userlist){
    if(person.login_name === login_name){
      return response.status(400).json({error: "Username already exist"});
    }
  }
  user = { first_name: first_name, last_name: last_name, login_name: login_name, password: password, location: location, occupation: occupation, description: description};
  
  try{
    const newUser = await User.create({
      first_name: user.first_name,
      last_name: user.last_name,
      location: user.location,
      description: user.description,
      occupation: user.occupation,
      login_name: user.login_name,
      password: user.password,
    });
    user.objectID = newUser._id;
    console.log(
      "Adding user:",
      user.first_name + " " + user.last_name,
      " with ID ",
      user.objectID
    );
    return response.json(user);
  }catch(err){
    return response.status(400).json({error: "Error creating the user"});
  }
});

app.post('/commentsOfPhoto/:photo_id', async (request, response) => {
  const { photo_id } = request.params;
  const { comment } = request.body;

  // Check if user is logged in
  if (!request.session.user) {
    return response.status(401).json({ error: 'Unauthorized' });
  }

  // Validate comment content
  if (!comment || comment.trim() === "") {
    return response.status(400).json({ error: 'Comment cannot be empty' });
  }

  try {
    // Find the photo by ID and add the comment
    const photo = await Photo.findById(photo_id);
    if (!photo) {
      return response.status(404).json({ error: 'Photo not found' });
    }

    // Add the comment to the photo
    const newComment = {
      comment: comment,
      user_id: request.session.user._id, // Add the logged-in user's ID
      date_time: new Date(),
    };
    photo.comments.push(newComment);
    await photo.save();

    return response.status(200).json({ message: 'Comment added successfully', newComment });
  } catch (error) {
    console.error('Error adding comment:', error);
    return response.status(500).json({ error: 'Server error' });
  }
});

app.post('/photos/new', (request, response) => {
  processFormBody(request, response, async function (err) {
    if (err || !request.file) {
        return response.status(400).send("No file uploaded");
    }

    // Generate a unique filename
    const timestamp = new Date().valueOf();
    const filename = 'U' + String(timestamp) + request.file.originalname;

    try {
      // Write the file to the server
      await new Promise((resolve, reject) => {
        fs.writeFile("./images/" + filename, request.file.buffer, function (error) {
          if (error) {
            reject(new Error("Error saving file"));  
          } else {
            resolve();  
          }
        });
      });

      // Create a new Photo object
      const newPhoto = new Photo({
        file_name: filename,
        date_time: new Date(),
        user_id: request.session.user._id,
      });

      // Save the photo 
      await newPhoto.save();

      // Respond to the client
      return response.status(200).send({ success: true, photo: newPhoto });
    } catch (error) {
      console.error(error);
      return response.status(500).send("Error saving photo");  
    }
    
  });
});

const server = app.listen(3000, function () {
  const port = server.address().port;
  console.log(
    "Listening at http://localhost:" +
      port +
      " exporting the directory " +
      __dirname
  );
});
