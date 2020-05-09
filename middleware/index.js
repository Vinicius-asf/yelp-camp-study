// all de customs middleware
const admin = require("firebase-admin"),
db = admin.firestore(),
firebase = require("firebase"),
campsCollection = db.collection("campground");

const middlewareObj = {};

middlewareObj.checkCampOwnership = (req, res, next)=>{
    firebase.auth().onAuthStateChanged(user =>{
        if(user){
            console.log("User is logged in");
            campsCollection.doc(req.params.id).get().then(documentSnapshot=>{
                if (user.uid == documentSnapshot.data().authorId){
                    console.log("User ownes the camp");
                    return next();
                }
                else{
                    req.flash("error", "You don't own it!");
                    res.redirect("back");
                };
            });
        }
        else{
            req.flash("error", "You need to be logged in to do that!");
            res.redirect("back");
        };
    });
}

middlewareObj.isLoggedIn = (req, res, next) =>{
    firebase.auth().onAuthStateChanged(user =>{
        if(user){
            console.log("User is logged in");
            return next();
        }
        else{
            req.flash("error", "Please, login first");
            res.redirect("/login")
        }
    });
};

middlewareObj.checkCommentOwnership = (req, res, next)=>{
    firebase.auth().onAuthStateChanged(user =>{
        if(user){
            console.log("User is logged in");
            campsCollection.doc(req.params.id).collection("comments").doc(req.params.comment_id).get().then(documentSnapshot=>{
                if (user.uid == documentSnapshot.data().authorId){
                    console.log("User ownes the comment");
                    return next();
                }
                else{
                    console.log("User doesn't ownes the comment!");
                    req.flash("error", "You don't own it!");
                    res.redirect("back");
                };
            }).catch(error=>{
                console.log("Couldn't fetch data");
                res.redirect("back")
            });
        }
        else{
            req.flash("error", "You need to be logged in to do that!");
            res.redirect("/login");
        };
    });
}
    
module.exports = middlewareObj