const express = require("express"),
app = express(),
body_parser = require("body-parser"),
methodOverride = require("method-override"),
session = require('express-session'),
cookieParser = require('cookie-parser'),
connect_flash = require("connect-flash");
// ############################################
// Initialize Cloud Firestore through Firebase
// ############################################
const admin = require("firebase-admin"),
serviceAccount = require("./credentials/yelp-camp-study-firebase-adminsdk.json"),
clientAccount = require("./credentials/firebase_apisdk_client.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
const firebase = require("firebase");
firebase.initializeApp(clientAccount);
const campsCollection = db.collection("campground");

const seedDB = require("./seeds");

// ##################
// App Configuration
// ##################
app.use(body_parser.urlencoded({
    extended: true
}));
app.set("view engine","ejs");
app.use(cookieParser('secret'));
app.use(session({cookie: { maxAge: 60000 }}));
app.use(connect_flash());
app.use(express.static(`${__dirname}/public`));
app.use((req, res, next)=>{
    res.locals.currentUser = firebase.auth().currentUser;
    res.locals.error_message = req.flash("error");
    res.locals.success_message = req.flash("success");
    next();
});
app.use(methodOverride("_method"));

process.on('SIGINT', ()=>{
    db.terminate().then(()=>{
        console.log(`Firestore has been teminated`);
        admin.app().delete().then(function() {
            console.log("Admin App deleted successfully");
            firebase.app().delete().then(()=>{
                console.log("App deleted successfully");
                process.exit()
            });
        }).catch(function(error) {
            console.log("Error deleting app:", error);
            process.exit()
        });
    });
});

// ########### 
// Seeding DB
// ########### 
// seedDB()

// ######################
// Routes and Router
// ######################
const commentRoutes = require("./routes/comments"),
campgroundsRoutes = require("./routes/campgrounds"),
indexRoutes = require("./routes/index");

app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundsRoutes);
app.use("/", indexRoutes);


app.listen(3000, ()=>{
    console.log("Server started");
});