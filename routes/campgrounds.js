const express = require("express"),
router = express.Router(),
admin = require("firebase-admin"),
db = admin.firestore(),
firebase = require("firebase"),
campsCollection = db.collection("campground"),
middleware = require("../middleware");


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
router.get("/new", middleware.isLoggedIn, (req, res)=>{
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
                }).catch(error =>{
                    // console.log(error);
                    res.render("campgrounds/show.ejs",
                    {
                        camp: documentSnapshot,
                        comments: []
                    });
                });
            }).catch(error =>{
                // console.log(error);
                res.render("campgrounds/show.ejs",
                {
                    camp: documentSnapshot,
                    comments: []
                });
            });
    });
});

// CREATE
router.post("/", middleware.isLoggedIn, (req,res)=>{
    // console.log(req.user);
    // let new_camp = {
    //     name: req.body.campName,
    //     imageURL: req.body.imageURL,
    //     desc: req.body.desc,
    //     author : firebase.auth().currentUser.displayName,
    //     authorId : firebase.auth().currentUser.uid
    // };
    // console.log(new_camp)
    req.body.camp["author"] = firebase.auth().currentUser.displayName;
    req.body.camp["authorId"] = firebase.auth().currentUser.uid;
    campsCollection.add(req.body.camp).then(documentReference => {
        console.log(`Added document with name: ${documentReference.id}`);
        res.redirect("/campgrounds");
    }).catch(error=>{
        console.log(error);
        req.flash("error", "Couldn't reach the database! Try again later.");
        res.redirect("/campgrounds");
    });
});

// EDIT
router.get("/:id/edit", middleware.checkCampOwnership, (req, res)=>{
    campsCollection.doc(req.params.id).get().then(documentSnapshot =>{
        res.render("campgrounds/edit", {camp: documentSnapshot})
    });
});

// UPDATE
router.put("/:id/edit", middleware.checkCampOwnership, (req, res)=>{
    campsCollection.doc(req.params.id).update(req.body.camp).then(response=>{
        console.log(`document updated`);
        req.flash("success", "Camp updated.");
        res.redirect(`/campgrounds/${req.params.id}`)
    });
});

// DESTROY
router.delete("/:id", middleware.checkCampOwnership, (req, res)=>{
    campsCollection.doc(req.params.id).listCollections().then(listSubCol =>{
        listSubCol.forEach(subcol=>{
            subcol.listDocuments().then(listDoc =>{
                listDoc.forEach(doc=>{
                    doc.delete()
                })
            });
        });
    });
    campsCollection.doc(req.params.id).delete().then(()=>{
        console.log("Camp deleted");
        req.flash("success", "Camp deleted.");
        res.redirect("/campgrounds");
    });
});

module.exports = router;