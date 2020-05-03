const express = require("express");
const app = express();
const body_parser = require("body-parser");

// Initialize Cloud Firestore through Firebase
const admin = require("firebase-admin");
const serviceAccount = require("./credentials/yelp-camp-study-firebase-adminsdk.json")
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();
// #################################################
const campsCollection = db.collection("campground")

// campsCollection.add({
//     name:"Granite Hill",
//     imageURL:"https://www.nps.gov/maca/planyourvisit/images/MapleSpringsCampground-Campsite.jpg",
//     desc:"A mountain full of granite rocks!"
// });

app.use(body_parser.urlencoded({
    extended: true
}));
app.set("view engine","ejs");

app.get("/", (req, res)=>{
    res.render("landing");
});

app.get("/campgrounds", (req, res)=>{
    let campsData = [];
    campsCollection.get().then(querySnapshot =>{
        querySnapshot.forEach(documentSnapshot => {
            console.log(documentSnapshot.data());
            campsData.push(documentSnapshot);
        });
        res.render("index", {campsData: campsData});
    });
});

app.get("/campgrounds/new",(req, res)=>{
    res.render("new.ejs");
});

app.get("/campgrounds/:id", (req, res)=>{
    //find the campground with the id
    campsCollection.doc(req.params.id).get().then(documentSnapshot =>{
        //render show with the campground info
        res.render("show.ejs", {campsData:documentSnapshot.data()})
    });
});

app.post("/campgrounds", (req,res)=>{
    let new_camp = {
        name: req.body.campName,
        imageURL: req.body.imageURL,
        desc: req.body.desc
    };
    console.log(new_camp)
    campsCollection.add(new_camp).then(documentReference => {
        console.log(`Added document with name: ${documentReference.id}`);
        res.redirect("/campgrounds");
      });
});

app.listen(3000, ()=>{
    console.log("Server started");
});