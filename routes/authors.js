var express = require("express");
var router = express.Router();
var databaseConnection = require("../database_connection");

router.get("/new", function(request, response, next) {
    response.render("authors/add_author", {layouts: "authors_layout"});
});

router.get("/:id", function(request, response, next) {
    databaseConnection("author")
        .select()
        .innerJoin("book_author", "author.id", "author_id")
        .innerJoin("book", "book_id", "book.id")
        .where("author.id", request.params.id)
    .then(function(authors){
        var authors = mapBooksToAuthors(authors);
        console.log(authors[0]);
        response.render("authors/get_author", {layouts: "authors_layout", author: authors[0]});
    });
});

router.get("/", function(request, response, next) {
    databaseConnection("author")
        .select()
        .innerJoin("book_author", "author.id", "author_id")
        .innerJoin("book", "book_id", "book.id")
    .then(function(records){
        var authors = mapBooksToAuthors(records);
        response.render("authors/list_authors", {layout: "authors_layout", authors: authors});
    });
});

router.get("/delete/:id", function(request, response, next) {
    databaseConnection("author")
        .select()
        .innerJoin("book_author", "author.id", "author_id")
        .innerJoin("book", "book_id", "book.id")
        .where("author.id", request.params.id)
    .then(function(authors){
        var authors = mapBooksToAuthors(authors);
        response.render("authors/delete_author", {layout: "authors_layout", author: authors[0]});
    });
});

router.get("/edit/:id", function(request, response, next) {
    databaseConnection("author")
        .select()
        .innerJoin("book_author", "author.id", "author_id")
        .innerJoin("book", "book_id", "book.id")
        .where("author.id", request.params.id)
    .then(function(authors){
        response.render("authors/edit_author", {layout: "authors_layout", author: authors[0]});
    });
});

router.post("/", function(request, response, next) {
    request.checkBody("title", "Title is empty or too long").notEmpty().isLength({max: 255});
    request.checkBody("genre", "Genre is empty or too long").notEmpty().isLength({max: 255});
    request.checkBody("description", "Description is missing or too long").notEmpty().isLength({max: 2000});
    request.checkBody("cover_image_url", "Not a URL").isUrl(request.body.cover_url);

    var errors = request.validationErrors();
    if (errors){
        response.render("error", {errors: errors});
    } else {
        databaseConnection("author").insert({
            title: request.body.title,
            genre: request.body.genre,
            description: request.body.description,
            cover_url: request.body.cover_image_url
        }).then(function(){
            response.redirect("/authors");
        });
    }
});

router.put("/:id", function(request, response, next) {
    request.checkBody("title", "Title is empty or too long").notEmpty().isLength({max: 255});
    request.checkBody("genre", "Genre is empty or too long").notEmpty().isLength({max: 255});
    request.checkBody("description", "Description is missing or too long").notEmpty().isLength({max: 10000});
    request.checkBody("cover_image_url", "Not a URL").isUrl(request.body.cover_url);

    var errors = request.validationErrors();
    if (errors){
        response.render("error", {errors: errors});
    } else {
        databaseConnection("author").update({
            title: request.body.title,
            genre: request.body.genre,
            description: request.body.description,
            cover_url: request.body.cover_image_url
        }).where("id", request.params.id).then(function(){
            response.redirect("/authors");
        });
    }
});

router.delete("/:id", function(request, response, next) {
    console.log("got to delete");
    databaseConnection("author")
        .del()
        .where("id", request.params.id)
    .then(function(){
        response.redirect("/authors");
    });
});

module.exports = router;

function mapBooksToAuthors(records){
    var mappedAuthors = records.reduce(function(mappedAuthors, currentRecord){
        currentRecord = reassignAuthorIdToId(currentRecord);
        var authorId = currentRecord.id

        var book = extractBookFromRecord(currentRecord);
        currentRecord = deleteBookFromRecord(currentRecord);

        if (!mappedAuthors.hasOwnProperty(authorId)){
            currentRecord.books = [book];
            mappedAuthors[authorId] = currentRecord;
        } else {
            mappedAuthors[authorId].books.push(book);
        }

        return mappedAuthors;
    }, {});

    var authors = [];
    for (var authorId in mappedAuthors){
        authors.push(mappedAuthors[authorId]);
    }
    return authors;
}

function extractBookFromRecord(record){
    return {
        id: record.author_id,
        title: record.title,
        description: record.description,
        cover_url: record.cover_url,
        genre: record.genre
    };
}

function deleteBookFromRecord(record){
    var properties = [
        "book_id", "title", "genre", "description", "cover_url"
    ];

    for (var i = 0, length = properties.length; i < length; i++){
        delete record[properties[i]];
    }

    return record;
}

function reassignAuthorIdToId(record){
    record.id = record.author_id;
    delete record.author_id;
    return record;
}
