
/*
* ----------------------------------------------------
* Imports
* ----------------------------------------------------
*/
const colorLib = require('./colorlib');
const bodyParser = require('body-parser');

/*
* ----------------------------------------------------
* Creation and Initilization of the Express Web-Server
* ----------------------------------------------------
*/

// Function to create and run a simple express HTTP server
function createWebServer() {
    // The directory where all .html files are stored
    const htmlPath = (__dirname + '/views/');

    // Allows css, img, and js resources within public to be served
    // and/or used by .html files
    webServerApp.use(webServerExpress.static('public'));

    // Allows the web-server to use body-parser to parse JSON
    webServerApp.use(bodyParser.json());

    // Serves index.html whenever the root of the 
    // webserver is requested (i.e. localhost)
    webServerApp.get('/', function(req, res) {
        res.sendFile(htmlPath + 'index.html');
    }); 

    // Serves about.html whenever root/about.html of the 
    // webserver is requested (i.e. localhost/about.html)
    webServerApp.get('/about.html', function(req, res) {
        res.sendFile(htmlPath + 'about.html');
    }); 

    // Serves 404.html whenever an unknown file is 
    // requested from the web-server
    webServerApp.get('*', function(req, res) {
        res.sendFile(htmlPath + '404.html');
    }); 

    // Listens on the given port for HTTP calls
    webServerApp.listen(webServerPort);
}

// Imports the express module
const webServerExpress = require('express');

// Creates a global express app for the web-server
const webServerApp = webServerExpress();

// Variable to store the desired web-server port
const webServerPort = 8080;

// Creates and runs an Express web-server
try {
    createWebServer();
} catch (error) {
    console.error('Error: ' + error);
    console.error('Express Web Server could not be started!');
}

/*
* ----------------------------------------------------
* Express Web-Server Listening for POST
* ----------------------------------------------------
*/

webServerApp.post('/api/clientMessage', async function (req, res) {
    console.log('start: ', process.hrtime());

    // Turns search keyword to lowercase
    var keyword = req.body.value.toLowerCase();

    // Calling the fetch image links from color library
    let imageLinks = [];
    console.log('start link fetch: ', process.hrtime());
    await colorLib.fetchImageLinks(keyword,
        'AIzaSyC37-yN0mhRqARSEDJbYC3HaanMUKNNIbw',
        '012928527837730696752:wzqnawdyxwc').then(function(result){
        imageLinks = result;
    });
    console.log('end link fetch: ', process.hrtime());

    console.log('start dominant fetch: ', process.hrtime());
    await colorLib.fetchDominantColorPalette(keyword, imageLinks).then(result => console.log(result));
    console.log('end dominant fetch: ', process.hrtime());

    console.log('end: ', process.hrtime());
    /* testing code
    var forest = colorLib.createColor(34,139,34);
    var lime = colorLib.createColor(0,128,0);

    var cols  = [forest, lime];
    var pal = colorLib.createPalette('green',cols);

    colorLib.addToDB(pal);
    */

    // Sends the response to the client
    res.send();
    //colorLib.addToDB(pal);
    //colorLib.addToDB(colorLib.createPalette('red',cols));
    console.log(colorLib.isStored('blue')); 
});