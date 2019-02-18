/*
* Module to handle creation of web-server
*/

// Imports the express module
const express = require("express");

// Creates a new express app
const app = express();

// Variable to store the desired web-server port
const port = 8080;

// The directory where all .html files are stored
const htmlPath = (__dirname + "/views/");

// Exports the contained modules when webserver.js is required
module.exports = 
{
    create: function()
    {
        // Allows css, img, and js resources within public to be served
        // and/or used by .html files
        app.use(express.static("public"));

        // Serves index.html whenever the root of the 
        // webserver is requested (i.e. localhost)
        app.get("/", function(req, res)
        {
            res.sendFile(htmlPath + "index.html");
        }); 

        // Serves about.html whenever root/about.html of the 
        // webserver is requested (i.e. localhost/about.html)
        app.get("/about.html", function(req, res)
        {
            res.sendFile(htmlPath + "about.html");
        }); 

        // Serves 404.html whenever an unknown file is 
        // requested from the web-server
        app.get("*", function(req, res)
        {
            res.sendFile(htmlPath + "404.html");
        }); 

        // Listens on the given port for HTTP calls
        app.listen(port, function() 
        {
            console.log("Example app listening on port ${port}!");
        });
    }
};

