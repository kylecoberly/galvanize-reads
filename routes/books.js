var express = require("express");
var router = express.Router();
var databaseConnection = require("../database_connection");

/* GET users listing. */
router.get("/", function(request, response, next) {
    databaseConnection("book").select().then(function(books){
        response.render("list_books", books);
    });
});

module.exports = router;
