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

    // Creates a body parser object to allow the web server to parse
    // the body of a POST request
    var bodyParser = require("body-parser");
    webServerApp.use(bodyParser.json());

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

    

    const cg = require('./colourlib');

    let collector = cg.fetchColour(req.body.value, 'AIzaSyC37-yN0mhRqARSEDJbYC3HaanMUKNNIbw','012928527837730696752:wzqnawdyxwc');
    Promise.all([collector])
    .then(files =>{
            files.forEach(file=>{
                    process(file.json());
                            
            
            })
    })
    .catch(err=>{
            
    });
            
    let process= (prom)=>{
            prom.then(data=>{
                            
                    items = data.items;
                    itemsLength = items.length;
                    URLS = [];
                    var i;
                    for(i = 0; i <itemsLength; i ++){
                            URLS.push(items[i].link);
                    }
                    //DO STUFF WITH URLS
                    console.log(URLS);
                            
            })
    }
       
});