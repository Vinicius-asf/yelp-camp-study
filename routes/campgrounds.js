const express = require("express"),
router = express.Router(),
admin = require("firebase-admin"),
db = admin.firestore(),
firebase = require("firebase"),
campsCollection = db.collection("campground");

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

// INDEX
router.get("/", (req, res)=>{
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
router.get("/new", isLoggedIn, (req, res)=>{
    res.render("campgrounds/new.ejs");
});

// SHOW
router.get("/:id", (req, res) => {
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
router.post("/", isLoggedIn, (req,res)=>{
    console.log(req.user);
    let new_camp = {
        name: req.body.campName,
        imageURL: req.body.imageURL,
        desc: req.body.desc,
        author : currentUser.displayName,
        authorId : currentUser.uid
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

module.exports = router;