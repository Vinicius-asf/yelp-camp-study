# YelpCamp

* Add Landing Page
* Add Campgrounds Page that listas all campgrounds

Each Campground has:
* Name
* Image

# Layout and Basic Styling
* Create header and footer partials
* Add in Bootstrap

# Create new Campgrounds
* Setup new campground POST route
* Add in body-parser
* Setup route to show form
* Add basic unstyled form

# Style the campgrounds Page
* Add a better header/title
* Make campgrounds display in a grid

# Style the Navbar and Form
* Add navbar to all templates
* Style the new campgrounds form

# Show page
* Review RESTful routes
* Add description to campground model
* Add a show route/template

# Refactoring code
* Create models directory
* Use module.export
* Require everything correctly

# Add Seeds file
* Add a seeds.js file
* Run the seeds file every time the server starts

# Add NEW and CREATE routes for comments
* Add new comment form
* Refact NEW and CREAT routes to add comments

# Add Auth and Users
* Auth configuration
* Auth header for the web

# Refactoring Routes
* Use Express Router
* Split routes into different files

# Delete and update Campgrounds
* Delete route
* Update route
* Destroy campgrounds
* Edit campgrounds
* Camps authorization

# Delete and update Comments
* Delete route
* Update route
* Destroy comments
* Edit comments
* Comments authorization

# Revamp UI and code
* Refactor middleware
* Flash messages
* Helpful Errors
* Refact Landing page

# RESTFUL ROUTES
name    url                             verb    desc
======================================================================================================
INDEX   /campgrounds                    GET     Display a list of campgrounds
NEW     /campgrounds/new                GET     Display a form to insert a new campground
CREATE  /campgorunds                    POST    Add new campground to DB
SHOW    /show:id                        GET     Shows info about one camp
NEW     /campgrounds/:id/comments/new   GET     Display a form to insert a new comment to a specific camp
CREATE  /campgrounds/:id/comments       POST    Add new comment to a specific campgrounds