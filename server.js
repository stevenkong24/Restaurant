const express = require('express');
const app = express();
const pug = require("pug");
const fs = require("fs");
const session = require('express-session')
app.use(session({ secret: 'some secret key here'}))

let mongo = require('mongodb');
const { getSystemErrorMap } = require('util');
const { request } = require('http');
let ObjectId = require("mongodb").ObjectId;
let MongoClient = mongo.MongoClient;
let db;

//Home page
app.get("/", (req, res)=>{
    db.collection("session").find().toArray(function(err, result){
        res.send(pug.renderFile("./views/home.pug", {session: result}));
    });
	
});

app.get("/users", users);
MongoClient.connect("mongodb://localhost:27017/", function(err, client) {
  if(err) throw err;
  db = client.db('a4');
  app.listen(3000);
  console.log("Listening on port 3000");
});

//Register page
app.get("/register", (req, res)=>{
    db.collection("session").find().toArray(function(err, result){
        if(err){
            res.status(500);
            return;
        }
        //Sends 404 if already logged in
        if (result[0].loggedIn){
            res.sendStatus(404)
        }
        else{
            res.send(pug.renderFile("./views/register.pug"));
        } 
    });
	
});

//Page for the user with the matching id
app.get("/users/:userId", (req, res)=>{

    let mongoId = new ObjectId(req.params.userId)
    db.collection("users").findOne({"_id": mongoId}, function(err, result){
        if(err){
            res.status(500);
            return;
        }
        db.collection("session").find().toArray(function(err, result2){
            if(err){
                res.status(500);
                return;
            }
            
            //Checks if the user has privacy on and the user logged in is not the page's user
            if (result.privacy && result.username != result2[0].user){
                res.sendStatus(404)
            }
            else{
                res.send(pug.renderFile("./views/user.pug", {user: result, session: result2}));
            }    
        });
    });
   
})

//Get the mongo generated id of the user with the matching username
app.get("/userId/:userName", (req, res)=>{
    db.collection("users").findOne({"username": req.params.userName}, function(err, result){
        if(err){
            res.status(500);
            return;
        }
        res.setHeader("Content-Type", "application/json");
        res.status(200).send(JSON.stringify(result));
    });  
})

//Updates the session data
app.get("/logout", (req, res)=>{
    db.collection("session").updateOne({"loggedIn":true}, {$set: {"loggedIn":false, "user": null, "id":null}}, function(err, result){});
    db.collection("session").find().toArray(function(err, result){
        res.send(pug.renderFile("./views/home.pug", {session: result}));      
    });
	
});

//Gets the login page
app.get("/login", (req, res)=>{
    db.collection("session").find().toArray(function(err, result){
        res.send(pug.renderFile("./views/login.pug", {session: result}));      
    });	
});

//When using a url with the form /users?name=SomeUserName, it goes to the route for /users
app.get("/users?", (req, res)=>{
    let strings = request.url.split('?');
    let [key, value] = strings[1].split('=');
    value = value.toLowerCase();
})

//Check if the user is allowed to access the page and then shows it if they are
app.get("/order",(req, res)=>{
    db.collection("session").find().toArray(function(err, result){
        if(err){
            res.status(500);
            return;
        }
        if (!result[0].loggedIn){
            res.sendStatus(401)
        }
        else{
            res.sendFile("./public/orderform.html", {root: __dirname })
        }   
    })
})

app.get("/client.js", (req, res)=>{	
	fs.readFile("client.js", function(err, data){
		if (err){
			res.statusCode = 500;
			return;
		}
		res.statusCode = 200;
		res.setHeader("Content-Type", "application/javascript");
		res.write(data);
        res.end();
	});
});

app.get("/orderform.js", (req, res)=>{
	fs.readFile("public/orderform.js", function(err, data){
		if (err){
			res.statusCode = 500;
			return;
		}
		res.statusCode = 200;
		res.setHeader("Content-Type", "application/javascript");
		res.write(data);
        res.end();
	});
});

app.get("/add.png", (req, res)=>{
    fs.readFile("public/add.png", function(err, data){
        if (err){
            res.stausCode = 500;
            return;
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "image");
        res.write(data);
        res.end();
    });
})

app.get("/remove.png", (req, res)=>{
    fs.readFile("public/remove.png", function(err, data){
        if (err){
            res.stausCode = 500;
            return;
        }
        res.statusCode = 200;
        res.setHeader("Content-Type", "image");
        res.write(data);
        res.end();
    });
})

//Sets the user to have a false privacy, adds the user to the list of users, and logs in the new user
app.post("/register", express.json(), (req, res)=>{
    let user = req.body;
    user.privacy = false;
    db.collection("users").findOne({"username": user.username}, function(err, result){
        if(err){
			res.status(500);
			return;
		}
        if (result == null){
            db.collection("users").insertOne(user, function(err, result){
                if(err){
                    throw err;
                }
            });
            db.collection("session").updateOne({"loggedIn":false}, {$set: {"loggedIn":true, "user": user.username, "id": user._id}}, function(err, result){})
        }
    });
});

//Logs in the user
app.post("/login", express.json(), (req, res)=>{
    let user = req.body;

    db.collection("session").updateOne({"loggedIn":false}, {$set: {"loggedIn":true, "user": user.username, "id": user.id}}, function(err, result){})
    res.sendStatus(200); 
});

//Saving the user's privacy
app.post("/savePrivacy", express.json(), (req, res)=>{
    let user = req.body;
    db.collection("users").findOneAndUpdate({"username": user.username}, {$set: {"privacy": user.checked}}, function(err, result){
        res.sendStatus(200);
    });
});

//Finding the users with privacy off
function users(req, res, next){
    db.collection("users").find({"privacy":false}).toArray(function(err, result){
		db.collection("session").find().toArray(function(err, result2){
            res.send(pug.renderFile("./views/users.pug", {users: result, session: result2}));
        });
	});
}