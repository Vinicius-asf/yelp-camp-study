const admin = require("firebase-admin"),
db = admin.firestore(),
firebase = require("firebase"),
campsCollection = db.collection("campground");

const express = require("express"),
router = express.Router();

router.get("/", (req, res)=>{
    res.render("landing");
});

// Register Routes
router.get("/register", (req, res)=>{
    res.render("register")
});

router.post("/register", (req, res)=>{
    auth.createUser({
        displayName: req.body.username,
        email: req.body.email,
        password: req.body.password,
    }).then(newUser=>{
        console.log("User created");
        console.log(newUser);
        // getUser(req.body.email);
        res.redirect("/");
    }).catch(error =>{
        console.log(error);
        res.redirect("/register")
    });
});

// Login Routes
router.get("/login", (req, res)=>{
    res.render("login")
});

router.post("/login", (req, res)=>{
    firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password).then(userCred =>{
        console.log(`User login successful`)
        // console.log(userCred)
        res.redirect("/")
    }).catch(error =>{
        console.log(error)
        res.redirect("/login")
    });
});

// Logout Routes
router.get("/logout", (req, res)=>{
    firebase.auth().signOut().then(()=>{
        console.log("User signed out");
        res.redirect("/")
    });
});

module.exports = router;