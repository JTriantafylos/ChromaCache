
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

    // Serves colorsearch.html whenever the root/colorsearch.html of the 
    // webserver is requested (i.e. localhost)
    webServerApp.get('/colorsearch', function(req, res) {
        res.sendFile(htmlPath + 'colorsearch.html');
    }); 
    // Serves contact-us.html whenever the root/contact-us.html of the 
    // webserver is requested (i.e. localhost)
    webServerApp.get('/contact-us', function(req, res) {
        res.sendFile(htmlPath + 'contact-us.html');
    });

    // Serves about.html whenever root/about.html of the 
    // webserver is requested (i.e. localhost/about.html)
    webServerApp.get('/about', function(req, res) {
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

/*
* ----------------------------------------------------
Request Architecture:

    is-user-stored(update-traffic)
        True -> Update user keyword log
        False -> Make new user
    
    is-palette-stored
        True -> is-palette-valid
                    True -> send-to-front
                    False -> request-new-palette
        False -> request-new-palette
    send-to-front()
        send-to-frontend((update-frequency-db))

* ----------------------------------------------------
*/



webServerApp.post('/api/clientMessage', async function (req, res) {
    // Turns search keyword to lowercase
    var keyword = req.body.value.toLowerCase();
    
    //trims address
    var client_ip = (req.ip).substring(7);
   
    //checks if the user is in the database
    await colorLib.isUserStored(client_ip).then(async function(user_in_db){

        //if is in database, increase the usages and add keyword to Searched
        //otherwise, create new user
        if(user_in_db){
            await colorLib.incUserDB(client_ip, keyword);
             
        }else{
            await colorLib.addToUserDB(client_ip, keyword);

        }
    });

    await colorLib.isPaletteStored(keyword).then(async function(palette_in_db){
        if(palette_in_db){
            // Check if palette stored in the database is valid (Less than 1 month old)
            await colorLib.isPaletteValid(keyword).then(async function(is_palette_valid){
                
                if(is_palette_valid){
                    //increase palette search record
                    //return database response
                    await colorLib.incPaletteDB(keyword);
                    await colorLib.fetchPalette(keyword).then(function(palette){
                        sendToFrontEnd(palette);
                        
                    });
                }else{
                    
                    var search_values = await colorLib.getSearches(keyword);
                    await colorLib.removeFromPaletteDB(keyword);
                    requestPalette(keyword, search_values);
                }

            });
            
        }else{
            requestPalette(keyword, 0);
        }

    });

    async function requestPalette(keyword, searches){

        // Calling the fetch image links from color library
        await colorLib.fetchImageLinks(keyword,
            'AIzaSyC37-yN0mhRqARSEDJbYC3HaanMUKNNIbw',
            '012928527837730696752:wzqnawdyxwc').then(async function(image_links){
            
            // Calling the fetch dominant palette from color library
            await colorLib.fetchDominantColorPalette(keyword, image_links).then(async function(color_palette){
                //adds new palette to database
                await colorLib.addToPaletteDB(color_palette, searches);
                sendToFrontEnd(color_palette);
            });

            
        });
    }
   
    // Sends the dominant palette to the client
    async function sendToFrontEnd(palette){
 
        res.send([palette, await colorLib.updateFrequentDb()]);
    }
    
    
});