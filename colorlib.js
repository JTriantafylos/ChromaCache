/*
* ----------------------------------------------------
* Imports
* ----------------------------------------------------
*/
const fetch = require('node-fetch');
const vision = require('@google-cloud/vision');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/paletteDB');
let db = mongoose.connection;

//checking for db connection
db.once('open', function(){
    console.log('Connected to MongoDB');
});

//checking for db errors
db.on('error', function(err){
    console.log(err);
});


//bring in palette model
let PaletteM = require('./models/palette');

//api_key = "AIzaSyC37-yN0mhRqARSEDJbYC3HaanMUKNNIbw"
//srch_eng_id = "012928527837730696752:wzqnawdyxwc"

// Creates a Google Vision image annotator client with the given service key
const imageClient = new vision.ImageAnnotatorClient({
    keyFilename: './secure/chromacache-d98d5cf45be5.json'
});

class Color{

    //constructor for color
    constructor( r, g, b){
            
        this.red = r;
        this.green = g;
        this.blue = b;

    }

    //basic getter and setters
    getRGB(){

        var col = {'red': this.red, 'green': this.green, 'blue':this.blue};
        return col;
    }


    
    //a string conversion for testing purposes 
    toString(){
        var outp = 'Color RGB is'+' Red : ' + this.red + ', Green: ' + this.green + ', Blue: ' + this.blue;
        return outp;
    }



}

class Palette{

    //constructor for palette
    constructor(keyword, colors){
        this.keyword = keyword;
        this.colors = colors;
    }

    //basic getters and setters
    getColors(){
        return this.colors;
    }

    getKeyword(){
        return this.keyword;
    }

    addColor(color){
        this.colors.push(color);
    }

    //a string conversion for testing purposes
    toString(){
        var outp = this.getKeyword() + '\n';
        this.colors.forEach(function(col){
            outp += col.toString() +'\n';
        });
        return outp;      
    }
}


module.exports = {
    fetchImageLinks:async function(keyword, api_key, srch_eng_id){
        // Holds the URL's to be returned
        var URLS = [];

        // Search request from the custom GSE(Google search engine)
        var srchRequest = 'https://www.googleapis.com/customsearch/v1?key=' + api_key + '&cx=' + srch_eng_id + '&q=' + keyword + '&searchType=image';

        // Fetches the JSON of the search request asynchronously
        var fetchResult = await fetch(srchRequest);
        var jsonResult = await fetchResult.json();

        // Parse through json items and collects URL's
        for (var item of jsonResult.items) {
            URLS.push(item.link);
        }
        // Returns an array of image links with 10 links in it
        return URLS;
    },

    fetchDominantColorPalette:async function(keyword, imageLinks){
        // Palette that will be filled and returned by this function
        var dominantPalette = new Palette(keyword, []);

        // Array of image properties for each image in imageLinks
        var imagePropertiesArray = [];

        for (let link of imageLinks) {
            // Gets the image properties of the current image link
            let [imageResult] = await imageClient.imageProperties(link);

            // Checks if there are valid image properties for the current
            // image, and if so, adds those properties to the imagePropertiesArray
            if (imageResult.imagePropertiesAnnotation != null){
                imagePropertiesArray.push(imageResult);
            }
        }
        // Iterates through the first 7 dominant colors of each image link
        // and adds their RGB 
        var i;
        for (i = 0; i <= 7; i++) {
            // Runnings totals for R, G, and B values
            var redTotal = 0;
            var greenTotal = 0;
            var blueTotal = 0;

            // Runnings total of how many dominant colors have been processed
            var colorCount = 0;

            for (let properties of imagePropertiesArray){
                // Gets the dominant colors of the current image link
                let dominantColors = properties.imagePropertiesAnnotation.dominantColors.colors;

                // Ensures that the current color number being iterated through
                // exists within the current images dominant colors
                if(i < dominantColors.length){
                    // Adds the R, G, and B (squared)
                    // values to running totals and increases counter
                    redTotal += Math.pow(dominantColors[i].color.red, 2);
                    greenTotal += Math.pow(dominantColors[i].color.green, 2);
                    blueTotal += Math.pow(dominantColors[i].color.blue, 2);

                    colorCount++;
                }
            }

            // Gets the average color from the array of images for the current color (n of 7)
            var redAverage = Math.floor(Math.sqrt(redTotal / colorCount));
            var greenAverage = Math.floor(Math.sqrt(greenTotal / colorCount));
            var blueAverage = Math.floor(Math.sqrt(blueTotal / colorCount));

            // Adds the new nth of 7 color to the palette as a new color object
            dominantPalette.addColor(new Color(redAverage, greenAverage, blueAverage));
            //console.log(dominantPalette);
        }
        // Returns a dominant palette with 7 colors in it
        return  dominantPalette;
    },

    addToDB: function (palette){
        
        //getting date of search
        var date = new Date();
        var d = [];
        d.push(date.getUTCMonth()+1);
        d.push(date.getUTCFullYear());

        //using the palette model from ./models/palette.js
        
        //saving palette to database and giving a success responce
        PaletteM.create({date:d, palette: palette})
            .catch(function(err){
                console.log('unsuccessful: ' + '\n' + err);
            });


    },


    fetchPalette: async function(key){
        var pal;
        
        //fetching palette from the database
        await PaletteM.find({ 'palette.keyword': key }, function(err, palette){
            if(err){
                console.log('error fetching palettes: ' + err);
            }else{
                
                palette.forEach(function(data){

                    //getting all the color values in the palette
                    pal =  (data.palette);
                });
            }
        });
        return pal;
       
        
    },

    isStored: async function(key){
        var count = await PaletteM.count({ 'palette.keyword': key });
        if(count == 0){
            return false;
        }else{
            return true;
        }
    },

    //this function will return true if the
    //color palette is recent, false if it needs updating
    isValid: async function(key){
        

        var valid;
        await PaletteM.find({ 'palette.keyword': key }, function(err, palette){
            if(err){
                console.log('error checking validity: ' + err);
            }else{
                //getting current date
                var date = new Date();
                var d = [];
                d.push(date.getUTCMonth()+1);
                d.push(date.getUTCFullYear());


                palette.forEach(function(data){
                    //comparing the dates
                    if(data.date[1] == d[1] && data.date[0] == d[0]){
                        
                        valid = true;
                    }else{
                        valid = false;
                    }
                    
                });
            }
        });
        return valid;

    },
    createColor: function(r, g, b){

        //using the color class
        var c = new Color(r, g, b);
        return c;
    },
    createPalette:function (keyword, colors){

        //using palette class
        var p = new Palette(keyword, colors);
        return p;
    }



};
        
        
        
 