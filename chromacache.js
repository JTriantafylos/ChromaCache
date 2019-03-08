
/*
* ----------------------------------------------------
* Imports
* ----------------------------------------------------
*/
const colorLib = require('./colorlib');
const bodyParser = require('body-parser');

const mongo_express = require('./node_modules/mongo-express/lib/middleware');
const mongo_express_config = require('./config');

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

    // Serves the mongo-express UI when path/mongo-express is navigated to
    webServerApp.use('/mongo_express', mongo_express(mongo_express_config));

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
    // Turns search keyword to lowercase
    var keyword = req.body.value.toLowerCase();
    
    //checks if the user is in the database
    await colorLib.isUser(req.ip).then(async function(res){

        //if is in database, increase the usages and add keyword to Searched
        //otherwise, create new user
        if(res){
            await colorLib.incUserDB(req.ip, keyword);
             
        }else{
            await colorLib.addToUserDB(req.ip, keyword);
        }
    });

    // Check if keyword is in palette database
    var stored;
    await colorLib.isStored(keyword).then(result => stored = result);

    if(stored){
        // Check if palette stored in the database is valid (Less than 1 month old)
        var valid;
        await colorLib.isValid(keyword).then(function(res){
            valid = res;
        });

        
        if(valid){

            //return database response
            await colorLib.fetchPalette(keyword).then(function(res){
                sendToFrontEnd(res);
                
            });
            
        }else{
            await colorLib.removeFromPaletteDB(keyword);
            collectPalette();
        }

    }else{
        collectPalette();
    }

    async function collectPalette(){
        // Calling the fetch image links from color library
        let imageLinks = [];
        await colorLib.fetchImageLinks(keyword,
            'AIzaSyC37-yN0mhRqARSEDJbYC3HaanMUKNNIbw',
            '012928527837730696752:wzqnawdyxwc').then(function(result){
            imageLinks = result;
        });

        // Calling the fetch dominant palette from color library
        await colorLib.fetchDominantColorPalette(keyword, imageLinks).then( async function (result) {
            //adds new palette to database
            await colorLib.addToPaletteDB(result);
            sendToFrontEnd(result);
        });

        
    }
    
    // Sends the dominant palette to the client

    function sendToFrontEnd(dp){
        colorLib.incToTrafficDB();

        res.send(dp);
    }
    
});