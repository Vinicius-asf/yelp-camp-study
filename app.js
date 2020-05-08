const express = require("express"),
app = express(),
body_parser = require("body-parser");
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
const auth = admin.auth();

const firebase = require("firebase");
firebase.initializeApp(clientAccount);

const seedDB = require("./seeds");

// ##################
// App Configuration
// ##################
const campsCollection = db.collection("campground");
app.use(body_parser.urlencoded({
    extended: true
}));
app.set("view engine","ejs");
app.use(express.static(`${__dirname}/public`))
app.use((req, res, next)=>{
    res.locals.currentUser = firebase.auth().currentUser;
    next();
});

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

// ###########
// Middlewares
// ###########
const isLoggedIn = (req, res, next) =>{
    firebase.auth().onAuthStateChanged(user =>{
        if(user){
            console.log("User is logged in");
            return next();
        }
        else{
            res.redirect("/login")
        }
    });
};


// #######
// ROUTES
// #######

app.get("/", (req, res)=>{
    res.render("landing", {firebaseClient: clientAccount});
});

// INDEX
app.get("/campgrounds", (req, res)=>{
    // console.log(firebase.auth().currentUser);
    let campsData = [];
    campsCollection.get().then(querySnapshot =>{
        querySnapshot.forEach(documentSnapshot => {
            // console.log(documentSnapshot.data());
            campsData.push(documentSnapshot);
        });
        res.render("campgrounds/index", {campsData: campsData});
    });
});

// NEW
app.get("/campgrounds/new",(req, res)=>{
    res.render("campgrounds/new.ejs");
});

// SHOW
app.get("/campgrounds/:id", (req, res) => {
    //find the campground with the id
    campsCollection.doc(req.params.id).get().then(documentSnapshot => {
        campsCollection.doc(req.params.id)
            .collection('comments')
            .listDocuments().then(commentsList => {
                db.getAll(...commentsList).then(commentsSnapshots => {
                    //render show with the campground info
                    res.render("campgrounds/show.ejs",
                        {
                            camp: documentSnapshot,
                            comments: commentsSnapshots
                        });
                })
            });
    });
});

// CREATE
app.post("/campgrounds", (req,res)=>{
    console.log(req.user);
    let new_camp = {
        name: req.body.campName,
        imageURL: req.body.imageURL,
        desc: req.body.desc
    };
    console.log(new_camp)
    campsCollection.add(new_camp).then(documentReference => {
        console.log(`Added document with name: ${documentReference.id}`);
        res.redirect("/campgrounds");
    }).catch(error=>{
        console.log(error);
        res.redirect("/campgrounds");
    });
});

// Comments Route
// NEW
app.get("/campgrounds/:id/comments/new", isLoggedIn, (req,res)=>{
    campsCollection.doc(req.params.id).get().then(documentSnapshot => {
        // console.log(documentSnapshot.data())
        res.render("comments/new", camp=documentSnapshot)
    }).catch(error =>{
        console.log(error);
        res.redirect(`/campgrounds/${req.params.id}`)
    });
});

// CREATE
app.post("/campgrounds/:id/comments", isLoggedIn, (req, res)=>{
    campsCollection.doc(req.params.id).collection('comments').add(req.body.comment).then(commentReference =>{
        console.log(`Added comment ${commentReference.id} to camp ${req.params.id}`);
        res.redirect(`/campgrounds/${req.params.id}`)
    }).catch(error =>{
        console.log(error);
        res.redirect(`/campgrounds/${req.params.id}`)
    });
});

// Register Routes
app.get("/register", (req, res)=>{
    res.render("register")
});

app.post("/register", (req, res)=>{
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
app.get("/login", (req, res)=>{
    res.render("login")
});

app.post("/login", (req, res)=>{
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
app.get("/logout", (req, res)=>{
    firebase.auth().signOut().then(()=>{
        console.log("User signed out");
        res.redirect("/")
    });
});

app.listen(3000, ()=>{
    console.log("Server started");
});