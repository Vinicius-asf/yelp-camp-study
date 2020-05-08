const admin = require("firebase-admin"),
db = admin.firestore(),
campsCollection = db.collection("campground");

const campsData = [
    {
        name: "Cloud's Rest",
        author: "Jown Snow",
        imageURL: "https://images.pexels.com/photos/1230302/pexels-photo-1230302.jpeg",
        desc: "A cloudy but beautyful camp! Bacon ipsum dolor amet fugiat hamburger enim ad non turducken pancetta cupim strip steak swine ea ex dolore jowl. Hamburger culpa bresaola, beef alcatra porchetta deserunt adipisicing brisket turkey. Eu biltong sausage cupim, beef ribs frankfurter swine et filet mignon burgdoggen ut in. Pork chop dolore spare ribs lorem hamburger eu, strip steak doner exercitation pastrami swine id sunt cupidatat. Pork loin lorem ea cupim meatloaf, magna biltong reprehenderit labore meatball quis. Ut turkey doner officia, salami ribeye pastrami sunt tempor bresaola consectetur velit.",
    },
    {
        name: "Camp of Distant Shores",
        author: "Vaan",
        imageURL: "https://images.pexels.com/photos/6757/feet-morning-adventure-camping.jpg",
        desc: "Adventure yourselves at this shores' camp! Bacon ipsum dolor amet fugiat hamburger enim ad non turducken pancetta cupim strip steak swine ea ex dolore jowl. Hamburger culpa bresaola, beef alcatra porchetta deserunt adipisicing brisket turkey. Eu biltong sausage cupim, beef ribs frankfurter swine et filet mignon burgdoggen ut in. Pork chop dolore spare ribs lorem hamburger eu, strip steak doner exercitation pastrami swine id sunt cupidatat. Pork loin lorem ea cupim meatloaf, magna biltong reprehenderit labore meatball quis. Ut turkey doner officia, salami ribeye pastrami sunt tempor bresaola consectetur velit.",
    },
    {
        name: "Desert Grounds",
        author: "Wanderer",
        imageURL: "https://images.pexels.com/photos/776117/pexels-photo-776117.jpeg",
        desc: "Arid but amazing atmosphere! Bacon ipsum dolor amet fugiat hamburger enim ad non turducken pancetta cupim strip steak swine ea ex dolore jowl. Hamburger culpa bresaola, beef alcatra porchetta deserunt adipisicing brisket turkey. Eu biltong sausage cupim, beef ribs frankfurter swine et filet mignon burgdoggen ut in. Pork chop dolore spare ribs lorem hamburger eu, strip steak doner exercitation pastrami swine id sunt cupidatat. Pork loin lorem ea cupim meatloaf, magna biltong reprehenderit labore meatball quis. Ut turkey doner officia, salami ribeye pastrami sunt tempor bresaola consectetur velit.",
    },
];

const commentsData = [
    {
        author: "Jake",
        text: "This camps ROCKS! 10/10 - would go there again!"
    },
    {
        author: "Andrea",
        text: "Doesn't have internet :'( Can't post my photos!"
    },

]

function seedDB(){
    // Remove all camps ='( if there is any!
    campsCollection.listDocuments().then(documentList => {
        if(documentList.length != 0){
            documentList.forEach(document=>{
                document.listCollections().then(collectionReferences =>{
                    collectionReferences.forEach(docCollection =>{
                        docCollection.listDocuments().then(subDocuments =>{
                            subDocuments.forEach(subDoc =>{
                                subDoc.delete()
                            });
                        });
                    });
                });
                document.delete().then(()=>{
                    console.log("Document successfully deleted");
                });
            });
        };
    }).then(()=>{
        // Add new camps!
        campsData.forEach(camp =>{
            campsCollection.add(camp).then(campReference =>{
                console.log(`Camp added! Documente id: ${campReference.id}`)
                commentsData.forEach(comment =>{
                    campReference.collection('comments').add(comment).then(commentReferemce =>{
                        console.log(`Comment ${commentReferemce.id} added to ${campReference.id} camp`)
                    });
                });
            });
        });
    });
}

module.exports = seedDB;