const express = require("express"),
router = express.Router({mergeParams: true}),
admin = require("firebase-admin"),
db = admin.firestore(),
firebase = require("firebase"),
campsCollection = db.collection("campground"),
middleware = require("../middleware");

// NEW
router.get("/new", middleware.isLoggedIn, (req,res)=>{
    campsCollection.doc(req.params.id).get().then(documentSnapshot => {
        // console.log(documentSnapshot.data())
        res.render("comments/new", camp=documentSnapshot)
    }).catch(error =>{
        console.log(error);
        req.flash("error", "Couldn't reach the page! Try again later.");
        res.redirect(`/campgrounds/${req.params.id}`)
    });
});

// CREATE
router.post("/", middleware.isLoggedIn, (req, res)=>{
    req.body.comment['author'] = firebase.auth().currentUser.displayName
    req.body.comment['authorId'] = firebase.auth().currentUser.uid
    campsCollection.doc(req.params.id).collection('comments').add(req.body.comment).then(commentReference =>{
        console.log(`Added comment ${commentReference.id} to camp ${req.params.id}`);
        res.redirect(`/campgrounds/${req.params.id}`);
    }).catch(error =>{
        console.log(error);
        req.flash("error", "Couldn't add the comment! Try again later.");
        res.redirect(`/campgrounds/${req.params.id}`);
    });
});

// EDIT
router.get("/:comment_id/edit", middleware.checkCommentOwnership, (req, res)=>{
    campsCollection
        .doc(req.params.id)
        .get()
        .then(documentSnapshot=>{
            campsCollection.doc(req.params.id)
                .collection("comments")
                .doc(req.params.comment_id)
                .get()
                .then(commentSnapshot =>{
                    res.render("comments/edit", {
                        camp: documentSnapshot,
                        comment: commentSnapshot
                    });
                }).catch(error=>{
                    console.log(error);
                    req.flash("error", "Couldn't reach the comment! Try again later.");
                    res.redirect(`/campgrounds/${req.params.id}`);
                });
        }).catch(error=>{
            console.log(error);
            req.flash("error", "Couldn't reach the page! Try again later.");
            res.redirect(`/campgrounds`); 
        });
});

// UPDATE
router.put("/:comment_id/edit", middleware.checkCommentOwnership, (req, res)=>{
    campsCollection
        .doc(req.params.id)
        .collection("comments")
        .doc(req.params.comment_id)
        .update(req.body.comment)
        .then(updated=>{
            console.log("Comment updated");
            res.redirect(`/campgrounds/${req.params.id}`);
        }).catch(error=>{
            console.log(error);
            req.flash("error", "Couldn't reach the comment! Try again later.");
            res.redirect(`/campgrounds/${req.params.id}`);
        });
});

// DESTROY
router.delete("/:comment_id", middleware.checkCommentOwnership, (req, res)=>{
    campsCollection.doc(req.params.id).collection("comments").doc(req.params.comment_id).delete().then(()=>{
        console.log("Comment deleted");
        res.redirect(`/campgrounds/${req.params.id}`);
    }).catch(error=>{
        console.log("Couldn't delete de comment! Try again later.");
        res.redirect(`/campgrounds/${req.params.id}`);
    });
});

module.exports = router;