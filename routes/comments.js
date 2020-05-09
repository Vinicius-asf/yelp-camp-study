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

const checkCommentOwnership = (req, res, next)=>{
    firebase.auth().onAuthStateChanged(user =>{
        if(user){
            console.log("User is logged in");
            campsCollection.doc(req.params.id).collection("comments").doc(req.params.comment_id).get().then(documentSnapshot=>{
                if (user.uid == documentSnapshot.data().authorId){
                    console.log("User ownes the comment");
                    return next();
                }
                else{
                    console.log("User doesn't ownes the comment!")
                    res.redirect("back");
                };
            }).catch(error=>{
                console.log("Couldn't fetch data");
                res.redirect("back")
            });
        }
        else{
            res.redirect("/login");
        };
    });
}

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
    req.body.comment['authorId'] = firebase.auth().currentUser.uid
    campsCollection.doc(req.params.id).collection('comments').add(req.body.comment).then(commentReference =>{
        console.log(`Added comment ${commentReference.id} to camp ${req.params.id}`);
        res.redirect(`/campgrounds/${req.params.id}`)
    }).catch(error =>{
        console.log(error);
        res.redirect(`/campgrounds/${req.params.id}`)
    });
});

// EDIT
router.get("/:comment_id/edit", checkCommentOwnership, (req, res)=>{
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
        });
    });
});

// UPDATE
router.put("/:comment_id/edit", checkCommentOwnership, (req, res)=>{
    campsCollection
        .doc(req.params.id)
        .collection("comments")
        .doc(req.params.comment_id)
        .update(req.body.comment)
        .then(updated=>{
            console.log("Comment updated");
            res.redirect(`/campgrounds/${req.params.id}`)
        });
});

// DESTROY
router.delete("/:comment_id", checkCommentOwnership, (req, res)=>{
    campsCollection.doc(req.params.id).collection("comments").doc(req.params.comment_id).delete().then(()=>{
        console.log("Comment deleted");
        res.redirect(`/campgrounds/${req.params.id}`)
    });
});

module.exports = router;