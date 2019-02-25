/*
* ----------------------------------------------------
* Creation and Initilization of the Express Web-Server
* ----------------------------------------------------
*/

// Function to create and run a simple express HTTP server
function createWebServer()
{
    // The directory where all .html files are stored
    const htmlPath = (__dirname + "/views/");

    // Allows css, img, and js resources within public to be served
    // and/or used by .html files
    webServerApp.use(webServerExpress.static("public"));

    // Serves index.html whenever the root of the 
    // webserver is requested (i.e. localhost)
    webServerApp.get("/", function(req, res)
    {
        res.sendFile(htmlPath + "index.html");
    }); 

    // Serves about.html whenever root/about.html of the 
    // webserver is requested (i.e. localhost/about.html)
    webServerApp.get("/about.html", function(req, res)
    {
        res.sendFile(htmlPath + "about.html");
    }); 

    // Serves 404.html whenever an unknown file is 
    // requested from the web-server
    webServerApp.get("*", function(req, res)
    {
        res.sendFile(htmlPath + "404.html");
    }); 

    // Listens on the given port for HTTP calls
    webServerApp.listen(webServerPort);
}

// Imports the express module
const webServerExpress = require("express");

// Creates a global express app for the web-server
const webServerApp = webServerExpress();

// Variable to store the desired web-server port
const webServerPort = 8080;

// Creates and runs an Express web-server
try
{
    createWebServer();
}
catch (error)
{
    console.error("Error: " + error);
    console.error("Express Web Server could not be started!");
}

/*
* ----------------------------------------------------
* Express Web-Server Listening for POST
* ----------------------------------------------------
*/

webServerApp.post("/api/clientMessage", function (req, res) 
{
    //var message = req.body.value;

    console.log(req.body);

    return res.send(req.body);
});