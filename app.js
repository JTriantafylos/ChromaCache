class Color
{
    constructor(red, green, blue)
    {
        this.red = red;
        this.green = green;
        this.blue = blue;
    }

}

// Array to store every color object array for each image
// matching the given label
var colorObjDatabase = [];
var imageUrlList = [];

// Asynchronous function that returns an array of JSON dominant colors
async function paletteSearch(imageUrl)
{
    // Imports the Google Cloud vision library
    const vision = require('@google-cloud/vision');

    // Creates a client with the parameter pointing to the keyfile registered to the server
    const client = new vision.ImageAnnotatorClient({
        keyFilename: '/var/www/html/ChromaCache-5fef4d2f2db5.json'
    });

    // Performs dominant color detection on the image file
    const [result] = await client.imageProperties(imageUrl);
    const colors = result.imagePropertiesAnnotation.dominantColors.colors;

    return colors;
}

// Function to parse a dominant colors object to an array
// of JSON objects with RGB values
function parseColorsToObject(colors)
{
    // Array to store each individual color object for a given image
    var colorObjList = [];

    // Iterates through each color object retrieved by finding the
    // dominant colors of an image and creates a new color object for
    // each dominant color with the RGB values
    var i;
    for(i = 0; i < colors.length; i++)
    {
        var colorObj = new Color(colors[i].color.red,
                                    colors[i].color.green,
                                    colors[i].color.blue);

        colorObjList.push(colorObj);
    }

    // Adds the list of color objects for a given image to the
    // database of all lists of color objects for each image
    // matching the search
    colorObjDatabase.push(colorObjList);
}

// Function to parse through each color object in each color object list
// in the color database, and determine the average color for each score level,
// as well as the number of colors that should be determined
function createAveragePalette(colorDatabase)
{
    // Variable to hold the average palette of color objects
    // returned by this function
    var averagePalette = [];


    // Variables to store the total number of colors in each color
    // list in the color database and the number color lists in the given
    // database
    var colorScoresTotal = 0;
    var colorListCount = colorDatabase.length;

    // Iterates through each color list in the color database and adds
    // the length of each list to a running count colorScoresTotal
    var i;
    for(i = 0; i < colorDatabase.length; i++)
    {
        colorScoresTotal += colorDatabase[i].length;
    }

    // Variable to store the average (floored) number of colors
    // in each color list in the database to find how many colors should
    // be included in the returned palette.
    var colorPaletteCount = Math.floor(colorScoresTotal / colorListCount);

    // Sets max possible number of palette colors to be at most 7
    if(colorPaletteCount > 7)
    {
        colorPaletteCount = 7;
    }

    // Iterates through each color object of the given score i, in each
    // color list in the database
    var i;
    for(i = 0; i < colorPaletteCount; i++)
    {
        // Variables to store the total RGB values for a specific score across
        // the database
        var averageRedTotal = 0;
        var averageGreenTotal = 0;
        var averageBlueTotal = 0;

        // Iterates through each list and adds the RGB values of each
        // color object at score i to the running totals declared above
        var j;
        for(j = 0; j < colorDatabase.length; j++)
        {
            // Breaks the loop if the current score value i
            // is greater than the number of distinct colors for a given image
            if(i >= colorDatabase[j].length)
            {
                continue;
            }

            averageRedTotal += colorDatabase[j][i].red;
            averageGreenTotal += colorDatabase[j][i].green;
            averageBlueTotal += colorDatabase[j][i].blue;
        }

        // Variables to store the average RGB values for the specific score
        // across the database
        var averageRed = Math.floor(averageRedTotal / colorDatabase.length);
        var averageGreen = Math.floor(averageGreenTotal / colorDatabase.length);
        var averageBlue = Math.floor(averageBlueTotal / colorDatabase.length);

        // Creates a new color object with the average RGB values for the
        // given score from every color list in the database
        averagePalette[i] = new Color(averageRed, averageGreen, averageBlue);
    }
    return averagePalette;
}

// Assynchronous function to iterate through each image url
// in the given image url array and find the average palette between all given
// images
async function findAveragePalette(imageUrlList)
{
    var i;
    for(i = 0; i < imageUrlList.length; i++)
    {
        var imageColors = await paletteSearch(imageUrlList[i]);

        parseColorsToObject(imageColors);
    }
    averagePalette = createAveragePalette(colorObjDatabase);
}

function populateImageUrlArray(searchWord)
{
    const api_key = "AIzaSyC37-yN0mhRqARSEDJbYC3HaanMUKNNIbw";
    const srch_eng_id = "012928527837730696752:wzqnawdyxwc";
    var srchRequest = "https://www.googleapis.com/customsearch/v1?key=" + api_key + "&cx=" + srch_eng_id + "&q=" + searchWord + "&searchType=image";
 
    let options = {
        mode: 'text',
        pythonPath: 'C:/Users/eyasv/AppData/Local/Programs/Python/Python37-32/python.exe',
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: '',
        args: [srchRequest]
    };

    var output = PythonShell.run('parse_json.py', options, function (err, results) {
      if (err) throw err;
      // results is an array consisting of messages collected during execution

      let temp_urls = []
      var temp_url =""
      var quote = false;
      //turn into an array
      
      var i;
      for(i =0; i< results[0].length;i++){
        if(results[0].charAt(i) == '|'){
            temp_urls.push(temp_url);
            

            temp_url = ""
        }else{
            temp_url += results[0].charAt(i);
    
        }
      }
      //console.log(temp_urls);
      return temp_urls;
      });
      //console.log(output);
      return (output)
}

// Drops root after being started since the app is being run on port 80
function drop_root()
{
    process.setgid('nobody');
    process.setuid('nobody');
}

var averagePalette;

var express = require("express");
var app = express();

var router = express.Router();
var bodyParser = require('body-parser');
app.use(bodyParser.json());

// Allows resources in the public folder to be directly referenced in html
app.use(express.static('public'));

// Directory of the html views
var path = __dirname + '/views/';

router.use(function (req,res,next)
    {
        console.log("/" + req.method);
        next();
    });

// Directs client to index.html when at root of website
app.get("/",function(req,res)
    {
        res.sendFile(path + "index.html");
    });

app.post("/api/url", function(req,res)
    {
        var search = {};
        search.value = req.body.value;

        imageUrlList = populateImageUrlArray(search.value)._endCallback();

        var waitUntil = require('wait-until');

        waitUntil(3000, 7, function condition() {
            return imageUrlList.length !== 0;
        }, function done(result) {

            findAveragePalette(imageUrlList);  
            return res.send(search);
        ;});

        

        
    });

app.get("/api/palette", function(req,res)
    {
        var waitUntil = require('wait-until');

        waitUntil(3000, 7, function condition() {
            return JSON.stringify(averagePalette) !== undefined;
        }, function done(result) {
            return res.send(JSON.stringify(averagePalette));
        });
    });


app.use("/",router);

// Redirects [domain]/* to the 404 html view, where * is a wildcard
app.use("*",function(req,res)
    {
        res.sendFile(path + "404.html");
    });

// Starts the app listening on port 80 and drops down from `root` to `nobody`
app.listen(80, function ()
    {
        drop_root();
        console.log('ChromaCache app listening on port 80!')
    })
