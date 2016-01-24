var express = require("express");
var router = express.Router();
var databaseConnection = require("../database_connection");

router.get("/", function(request, response, next) {
    databaseConnection("book").select().then(function(books){
        response.render("list_books", {books: books});
    });
});

router.get("/new", function(request, response, next) {
    response.render("add_book");
});

router.post("/", function(request, response, next) {
    request.checkBody("title", "Title is empty or too long").notEmpty().isLength({max: 255});
    request.checkBody("genre", "Genre is empty or too long").notEmpty().isLength({max: 255});
    request.checkBody("description", "Description is missing or too long").notEmpty().isLength({max: 2000});
    request.checkBody("cover_url", "Not a URL").isUrl();

    var errors = request.validationErrors();
    if (errors){
        response.render("error", {errors: errors});
    } else {
        databaseConnection("book").insert({
            title: request.body.title,
            genre: request.body.genre,
            description: request.body.description,
            cover_url: request.body.cover_url
        }).then(function(){
            response.redirect("/books");
        });
    }
});

module.exports = router;
