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

//const vision = require('@google-cloud/vision');

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

//tester code

//   var forest = new Color(34,139,34);
//   console.log(forest.getRGB());
//   console.log(forest.toString());

//   var lime = new Color(0,128,0);


//   var cols  = [forest, lime];
//   var pal = new Palette('green',cols);

//   console.log(pal.toString());
//   pal.addColors(lime);
//   console.log(pal);
//   addToDB(pal);

module.exports = {
    fetchImageLinks:function(keyword, api_key, srch_eng_id){

        //search request from the custom GSE(Google search engine)
        var srchRequest = 'https://www.googleapis.com/customsearch/v1?key=' + api_key + '&cx=' + srch_eng_id + '&q=' + keyword + '&searchType=image';

        //fetch from node-fetch
        fetch(srchRequest).then(res => res.json())
            .then(function(json) {
                //got json, now splitting into separate URL's
                
                //splitting json into elements
                var items = json.items;
                var itemsLength = items.length;
                
                
                //holds the URL's
                var URLS = [];


                //parse through json items and collects URL's
                var i;
                for(i = 0; i <itemsLength; i ++){
                
                    URLS.push(items[i].link);
                
                }

                
                //do stuff
                console.log(URLS);
                
                
            }).catch(function(error) {
                
                //catches any potential 404 errors
                console.log('Error: ', error);
            });      
    },

    fetchDominantColorPalette:async function(keyword, imageLinks){
        // Palette that will be filled and returned by this function
        var dominantPalette = new Palette(keyword, []);

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

            for(let link of imageLinks){
                // Gets the image properties of the current image link
                let [imageResult] = await imageClient.imageProperties(link);

                //console.log('test', imageResult);

                // Gets the dominant colors of the current image link
                let dominantColors = imageResult.imagePropertiesAnnotation.dominantColors.colors;

                // Adds the R, G, and B 
                // values to running totals and increases counter
                redTotal += dominantColors[i].color.red;
                greenTotal += dominantColors[i].color.green;
                blueTotal += dominantColors[i].color.blue;
                
                colorCount++;
                //console.log("test");
            }

            // Gets the average color from the array of images for the current color (n of 7)
            var redAverage = redTotal / colorCount;
            var greenAverage = greenTotal / colorCount;
            var blueAverage = blueTotal / colorCount;

            // Adds the new nth of 7 color to the palette as a new color object
            dominantPalette.addColor(new Color(redAverage, greenAverage, blueAverage));
            //console.log(dominantPalette);
        }
        // Returns a dominant palette with 7 colors in it
        //console.log("Test")
        return  dominantPalette;
    },

    addToDB: function (palette){
       
        //using the palette model from ./models/palette.js
        //const p = new PaletteM();
        
        //saving palette to database and giving a success responce
        PaletteM.create({palette: palette}).then(() => (console.log('added: ' + '\n'+ palette))).catch(function(err){
            console.log('unsuccessful: ' + '\n' + err);
        });


    },


    fetchPalette: function(key){

        PaletteM.find({ "palette.keyword": key }, function(err, palette){
            if(err){
                console.log('error fetching palettes: ' + err);
            }else{
                
                palette.forEach(function(data){

                    //getting all the color values in the palette
                    return (data.palette.colors);
                });
            }
        });
        
       
        
    },

    isStored: function(key){
        if(PaletteM.count({ "palette.keyword": key }) == 0){
            return false;
        }else{
            return true;
        }
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
        
        
        
 