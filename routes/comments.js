const express = require("express"),
router = express.Router({mergeParams: true}),
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

// NEW
router.get("/new", isLoggedIn, (req,res)=>{
    campsCollection.doc(req.params.id).get().then(documentSnapshot => {
        // console.log(documentSnapshot.data())
        res.render("comments/new", camp=documentSnapshot)
    }).catch(error =>{
        console.log(error);
        res.redirect(`/campgrounds/${req.params.id}`)
    });
});

// CREATE
router.post("/", isLoggedIn, (req, res)=>{
    req.body.comment['author'] = firebase.auth().currentUser.displayName
    req.body.comment['authorID'] = firebase.auth().currentUser.uid
    campsCollection.doc(req.params.id).collection('comments').add(req.body.comment).then(commentReference =>{
        console.log(`Added comment ${commentReference.id} to camp ${req.params.id}`);
        res.redirect(`/campgrounds/${req.params.id}`)
    }).catch(error =>{
        console.log(error);
        res.redirect(`/campgrounds/${req.params.id}`)
    });
});

module.exports = router;