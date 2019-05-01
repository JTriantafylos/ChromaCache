/*
* ----------------------------------------------------
* Imports
* ----------------------------------------------------
*/
const fetch = require('node-fetch');
const vision = require('@google-cloud/vision');
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/paletteDB',{ useNewUrlParser: true });
let db = mongoose.connection;

//checking for db connection
db.once('open', function(){
    console.log('Connected to MongoDB');
});

//checking for db errors
db.on('error', function(err){
    console.error(err);
});

/*
* ----------------------------------------------------
* Models
* ----------------------------------------------------
*/

let PaletteM = require('./models/palette');
let TrafficM = require('./models/traffic');
let UsersM = require('./models/users');
// eslint-disable-next-line no-unused-vars
let FrequencyM = require('./models/frequentPalette');

//color harmony reference material
//http://www.tigercolor.com/color-lab/color-theory/color-harmonies.htm
//https://www.sessions.edu/color-calculator/

// Creates a Google Vision image annotator client with the given service key
const imageClient = new vision.ImageAnnotatorClient({
    keyFilename: './secure/chromacache-d98d5cf45be5.json'
});

//a color that doesn't have a Harmonies parameter
class SubColor{

    //constructor for sub-color
    //RGB in int array
    constructor(RGB){    
        this.RGB = RGB;

    }
    
    //getter for RGB array
    getRGB(){
        return this.RGB;
    }

}

//a palette that doesn't require a keyword and is filled with sub-colors
class SubPalette{
    
    //constructor for sub-palettes
    //subColors are sub-colors
    constructor(subColors){
        this.subColors = subColors;
    }

    //adding a new sub-color to the end of the sub-palette
    addSubColor(subColor){
        this.subColors.push(subColor);
    }

    //getter for a sub-color at the given index
    //index is an integer
    getSubColor(index){
        return (this.subColors[index]);
    }

}

//Harmonies holds sub-palettes of different sizes
class Harmonies{

    //constructor for a Harmony
    //subPalettes are sub-palettes
    constructor(subPalettes){
        this.subPalettes = subPalettes;
    }

    //adding a new sub-palette to the end of the Harmony
    //subPalettes are sub-palettes
    addSubPalette(subPalette){
        this.subPalettes.push(subPalette);
    }

    //getter for a sub-palette at the given index
    //index is an integer
    getSubPalette(index){
        return (this.subPalettes[index]);
    }
}

//this color class will hold an RGB array and hold sub-palettes
class Color{

    //constructor for a color
    //RGB in int array
    //harmonies are sub-palettes
    constructor(RGB, harmonies){
        this.RGB = RGB;
        this.harmonies = harmonies;

    }

}

class Palette{

    //constructor for palette
    //keyword is string
    //colors is a color array
    constructor(keyword, colors){
        this.keyword = keyword;
        this.colors = colors;
    }

    //adding a new color to the end of the Palette
    addColor(color){
        this.colors.push(color);
    }

}

//holds the searched keywords of the user
class Searches{

    //constructor for searches
    //keyword is string
    constructor(keywords){
        this.keywords = keywords;
    }

    //adding a new color to the end of the Searches
    //keyword is string
    addKeyWord(keyword){
        this.keywords.push(keyword);
    }

}

function createHarmonies(RGB){

    var harmony = new Harmonies([]);
    
    //methods to generate the color harmonies
    harmony.addSubPalette(new SubPalette(createComplementaryPalette(RGB)));
    harmony.addSubPalette(new SubPalette(createTriadicPalette(RGB)));
    harmony.addSubPalette(new SubPalette(createAnalogousPalette(RGB)));
    harmony.addSubPalette(new SubPalette(createTetradicPalette(RGB)));
    harmony.addSubPalette(new SubPalette(createSplitComplementaryPalette(RGB)));
    harmony.addSubPalette(new SubPalette(createTintShadeMap(RGB)));
    
    return harmony;
}

function createComplementaryPalette(RGB){

    var subPalette = new SubPalette([]);
    subPalette.addSubColor(new SubColor(RGB));

    //newRGB will be the RGB after the rearrangement
    var newRGB = [];

    /*
    * ------------------------------------------------
    * checking which values in the RGB is the largest
    * and which value is the smallest
    * ------------------------------------------------
    */
    if(RGB[0] >= RGB[1] && RGB[0] >= RGB[2]){
        //0 index has largest RGB value
        if(RGB[1] <= RGB[2]){
            //1 index has smallest value
            newRGB.push(RGB[1]);
            newRGB.push(RGB[0]);
            newRGB.push((RGB[0]+RGB[1])-RGB[2]);

        }else{
            //2 index has smallest value
            newRGB.push(RGB[2]);
            newRGB.push((RGB[0]+RGB[2])-RGB[1]);
            newRGB.push(RGB[0]);
            
        }

    }else if(RGB[1] > RGB[0] && RGB[1] >= RGB[2]){
        //1 index has largest RGB value
        if(RGB[0] <= RGB[2]){
            //0 index has smallest value
            newRGB.push(RGB[1]);
            newRGB.push(RGB[0]);
            newRGB.push((RGB[1]+RGB[0])-RGB[2]);

        }else{
            //2 index has smallest value
            newRGB.push((RGB[1]+RGB[2])-RGB[0]);
            newRGB.push(RGB[2]);
            newRGB.push(RGB[1]);

        }

    }else if(RGB[2] > RGB[1] && RGB[2] > RGB[0]){
        //2 index has largest RGB value
        if(RGB[0] <= RGB[1]){
            //0 index has smallest value
            newRGB.push(RGB[2]);
            newRGB.push((RGB[2]+RGB[0])-RGB[1]);
            newRGB.push(RGB[0]);

        }else{
            //1 index has smallest value 
            newRGB.push((RGB[2]+RGB[1])-RGB[0]);
            newRGB.push(RGB[2]);
            newRGB.push(RGB[1]);

        }

    }
   
    subPalette.addSubColor(new SubColor(newRGB));
    
    return subPalette;
}
function createTetradicPalette(RGB){
    var subPalette = createComplementaryPalette(RGB);
    //newRGB will be the RGB after the rearrangement
    var newRGB = [];

    //rearrangement for a new sub-color
    newRGB.push(RGB[1]);
    newRGB.push(RGB[2]);
    newRGB.push(RGB[0]);

    subPalette.addSubColor(new SubColor(newRGB));

    /*
    * ------------------------------------------------
    * checking which values in the RGB is the largest
    * and which value is the smallest
    * ------------------------------------------------
    */
    if(newRGB[0] >= newRGB[1] && newRGB[0] >= newRGB[2]){
        //0 index has largest RGB value
        if(newRGB[1] <= newRGB[2]){
            //1 index has smallest value
            subPalette.addSubColor(new SubColor([newRGB[1], newRGB[0], ((newRGB[0]+newRGB[1])-newRGB[2])]));

        }else{
            //2 index has smallest value
            subPalette.addSubColor(new SubColor([newRGB[2], ((newRGB[0]+newRGB[2])-newRGB[1]), newRGB[0]]));
        }

    }else if(newRGB[1] > newRGB[0] && newRGB[1] >= newRGB[2]){
        //1 index has largest RGB value
        if(newRGB[0] <= newRGB[2]){
            //0 index has smallest value
            subPalette.addSubColor(new SubColor([newRGB[1], newRGB[0], ((newRGB[1]+newRGB[0])-newRGB[2])]));
        }else{
            //2 index has smallest value
            subPalette.addSubColor(new SubColor([((newRGB[1]+newRGB[2])-newRGB[0]), newRGB[2], newRGB[1]]));
        }

    }else if(newRGB[2] > newRGB[1] && newRGB[2] > newRGB[0]){
        //2 index has largest RGB value
        if(newRGB[0] <= newRGB[1]){
            //0 index has smallest value
            subPalette.addSubColor(new SubColor([newRGB[2], ((newRGB[2]+newRGB[0])-newRGB[1]), newRGB[0]]));
        }else{
            //1 index has smallest value
            subPalette.addSubColor(new SubColor([((newRGB[1]+newRGB[2])-newRGB[0]), newRGB[2], newRGB[1]]));
        }

    }
    return subPalette;


}
function createTriadicPalette(RGB){
    var subPalette = new SubPalette([]);

    //creating new sub-colors with the rearrangement of the original RGB values
    subPalette.addSubColor(new SubColor(RGB));
    subPalette.addSubColor(new SubColor([RGB[1], RGB[2], RGB[0]]));
    subPalette.addSubColor(new SubColor([RGB[2], RGB[0], RGB[1]]));

    return subPalette;

}
function createAnalogousPalette(RGB){

    //delta is used to check if a set of processes should proceed
    //delta is also used to calculate phi and theta
    var delta;

    var phi;        //phi is the [largest value] - abs(delta)
    var theta;      //theta is the [smallest value] + abs(delta)
    var subPalette = new SubPalette([]);
    subPalette.addSubColor(new SubColor(RGB));

    /*
    * ------------------------------------------------
    * checking which values in the RGB is the largest
    * and which value is the smallest
    * ------------------------------------------------
    */
    if(RGB[0] >= RGB[1] && RGB[0] >= RGB[2]){
        //0 index has largest RGB value
        if(RGB[1] <= RGB[2]){
            //1 index has smallest value
            delta = RGB[2] - ((RGB[0] + RGB[1])/2);

            //a check to see how the RGB in the sub-colors should be arranged
            if(delta >0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[0] - delta;
                theta = RGB[1] + delta;

                subPalette.addSubColor(new SubColor([phi, RGB[1], RGB[0]]));
                subPalette.addSubColor(new SubColor([RGB[0], RGB[1], theta]));

            }else if (delta < 0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[0] - delta;
                theta = RGB[1] + delta;

                subPalette.addSubColor(new SubColor([RGB[0], theta, RGB[1]]));
                subPalette.addSubColor(new SubColor([RGB[0], RGB[1], phi]));
            }else{
                subPalette.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
                subPalette.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
            }
            
        }else{
            //2 index has smallest value
            delta = RGB[1] - ((RGB[0] + RGB[2])/2);

            //a check to see how the RGB in the sub-colors should be arranged
            if(delta >0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[0] - delta;
                theta = RGB[2] + delta;

                subPalette.addSubColor(new SubColor([phi, RGB[0], RGB[2]]));
                subPalette.addSubColor(new SubColor([RGB[0], theta, RGB[2]]));

            }else if (delta < 0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[0] - delta;
                theta = RGB[2] + delta;

                subPalette.addSubColor(new SubColor([RGB[0], RGB[2], theta]));
                subPalette.addSubColor(new SubColor([RGB[0], phi, RGB[2]]));
            }else{
                subPalette.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
                subPalette.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
            }
        }

    }else if(RGB[1] > RGB[0] && RGB[1] >= RGB[2]){
        //1 index has largest RGB value
        if(RGB[0] <= RGB[2]){
            //0 index has smallest value
            delta = RGB[2] - ((RGB[1] + RGB[0])/2);

            //a check to see how the RGB in the sub-colors should be arranged
            if(delta >0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[1] - delta;
                theta = RGB[0] + delta;

                subPalette.addSubColor(new SubColor([RGB[0], phi, RGB[1]]));
                subPalette.addSubColor(new SubColor([RGB[0], RGB[1], theta]));

            }else if (delta < 0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[1] - delta;
                theta = RGB[0] + delta;

                subPalette.addSubColor(new SubColor([theta, RGB[1], RGB[0]]));
                subPalette.addSubColor(new SubColor([RGB[0], RGB[1], phi]));
            }else{
                subPalette.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
                subPalette.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
            }

        }else{
            //2 index has smallest value
            delta = RGB[0] - ((RGB[1] + RGB[2])/2);

            //a check to see how the RGB in the sub-colors should be arranged
            if(delta >0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[1] - delta;
                theta = RGB[2] + delta;

                subPalette.addSubColor(new SubColor([RGB[1], phi, RGB[2]]));
                subPalette.addSubColor(new SubColor([theta, RGB[1], RGB[2]]));

            }else if (delta < 0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[1] - delta;
                theta = RGB[2] + delta;

                subPalette.addSubColor(new SubColor([RGB[2], RGB[1], theta]));
                subPalette.addSubColor(new SubColor([phi, RGB[1], RGB[2]]));
            }else{
                subPalette.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
                subPalette.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
            }

        }

    }else if(RGB[2] > RGB[1] && RGB[2] > RGB[0]){
        //2 index has largest RGB value
        if(RGB[0] <= RGB[1]){
            //0 index has smallest value
            delta = RGB[1] - ((RGB[2] + RGB[0])/2);

            //a check to see how the RGB in the sub-colors should be arranged
            if(delta >0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[2] - delta;
                theta = RGB[0] + delta;

                subPalette.addSubColor(new SubColor([RGB[0], RGB[2], phi]));
                subPalette.addSubColor(new SubColor([RGB[0], theta, RGB[2]]));

            }else if (delta < 0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[2] - delta;
                theta = RGB[0] + delta;

                subPalette.addSubColor(new SubColor([theta, RGB[0], RGB[2]]));
                subPalette.addSubColor(new SubColor([RGB[0], phi, RGB[2]]));
            }else{
                subPalette.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
                subPalette.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
            }

        }else{
            //1 index has smallest value 
            delta = RGB[0] - ((RGB[2] + RGB[1])/2);

            //a check to see how the RGB in the sub-colors should be arranged
            if(delta >0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[2] - delta;
                theta = RGB[1] + delta;

                subPalette.addSubColor(new SubColor([RGB[2], RGB[1], phi]));
                subPalette.addSubColor(new SubColor([theta, RGB[1], RGB[2]]));

            }else if (delta < 0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[2] - delta;
                theta = RGB[1] + delta;

                subPalette.addSubColor(new SubColor([RGB[1], theta, RGB[2]]));
                subPalette.addSubColor(new SubColor([phi, RGB[1], RGB[2]]));
            }else{
                subPalette.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
                subPalette.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
            }

        }

    }

    return subPalette;

}
function createSplitComplementaryPalette(RGB){
    
    var analogous = createAnalogousPalette(RGB);
    var subPalette = new SubPalette([]);

    //sub-palette is made of the complementary of the analogous colors of RGB
    subPalette.addSubColor(new SubColor(RGB));
    subPalette.addSubColor(createComplementaryPalette(analogous.getSubColor(1).getRGB()).getSubColor(1));
    subPalette.addSubColor(createComplementaryPalette(analogous.getSubColor(2).getRGB()).getSubColor(1));

    return subPalette;
    
    
}

function createTintShadeMap(RGB){

    //following are used to calculate the tints    
    var delta = 255 - RGB[0];       //the new value of white added from the Red
    var rho = 255 - RGB[1];         //the new value of white added from the Green
    var pi = 255 - RGB[2];          //the new value of white added from the Blue
    
    //following are used to calculate the new RGB values
    var phi;        //new value of Red
    var theta;      //new value of Green
    var omega;      //new value of Blue

    var subPalette = new SubPalette([]);

    //generating and adding 3 shades to sub-palette (shades =adding 'black')
    var i;
    for (i = 0; i < 3; i++){
        phi = Math.round(((1+i)/4) *RGB[0]);
        theta = Math.round(((1+i)/4) * RGB[1]);
        omega = Math.round(((1+i)/4) * RGB[2]);

        subPalette.addSubColor(new SubColor([phi,theta, omega]));

    }

    //adding the sub-color from the original RGB to the sub-palette
    subPalette.addSubColor(new SubColor(RGB));

    //generating and adding 3 tints to sub-palettes (tints = adding 'white')
    var t;
    for (t = 0; t < 3; t++){
        phi = Math.round((delta *((1+t)/4)) + RGB[0]);
        theta = Math.round((rho *((1+t)/4)) + RGB[1]);
        omega = Math.round((pi *((1+t)/4)) + RGB[2]);
        
        subPalette.addSubColor(new SubColor([phi,theta, omega]));

    }
    return subPalette;
}

async function incTrafficDB(){
    var date = new Date();
    var currentDate = [];
    currentDate.push(date.getDate());
    currentDate.push(date.getMonth()+1);
    currentDate.push(date.getUTCFullYear());

    await TrafficM.find({'date':currentDate}).then(async function(traffic){

        //checking to see if there has been any traffic
        if(traffic.length == 0){
            
            //if there is no traffic, create an instance for the day
            TrafficM.create({'date':currentDate, 'traffic': 1});
        }else{
            await traffic.forEach(async function(data){  

                //increases traffic
                await TrafficM.updateOne({'date':currentDate},{$set: {'traffic':((data.traffic) +1)}}, {multi: false});
                
            });
        }
        
    }).catch(function(err){
        console.error('error updating traffic: ' + err);
    }); 
}
//currently using a bubble sort, but eventually want
//to upgrade to a sorting algorithm with a better
//run-time complexity
function sortDictionary(dict){
    var dictKeys = [];
    var dictValues = [];

    //converting dictionary to arrays
    for(var keys in dict){
        dictKeys.push(keys);
        dictValues.push(dict[keys]);
    }
    
    //bubble sort algorithm
    var swapped;    
    do {
        swapped = false;
        for (var i = 0; i < dictKeys.length-1; i++) {
            if (dictValues[i] < dictValues[i+1]) {
                var tempK = dictKeys[i];
                var tempV = dictValues[i];
                dictKeys[i] = dictKeys[i+1];
                dictValues[i] = dictValues[i+1];

                dictKeys[i+1] = tempK;
                dictValues[i+1] = tempV;

                swapped = true;
            }
        }
    } while (swapped);
    
        
    //converting the two arrays into a dictionary again
    var tempDict = new Object();
    for(var t = 0; t < dictKeys.length; t++){
        tempDict[dictKeys[t]] = dictValues[t];

    }
    return tempDict;
    
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
        for (i = 0; i < 7; i++) {
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
            var RGB = [];
            // Gets the average color from the array of images for the current color (n of 7)
            //red average
            RGB.push(Math.floor(Math.sqrt(redTotal / colorCount)));
            //green average
            RGB.push(Math.floor(Math.sqrt(greenTotal / colorCount))) ;
            //blue average
            RGB.push(Math.floor(Math.sqrt(blueTotal / colorCount)));

            

            // Adds the new nth of 7 color to the palette as a new color object
            dominantPalette.addColor(new Color(RGB, createHarmonies(RGB)));
            //console.log(dominantPalette);
        }
        // Returns a dominant palette with 7 colors in it
        return  dominantPalette;
    },
    addToPaletteDB: async function (palette, searches){
        
        //getting date of search
        var date = new Date();
        var currentDate = [];
        currentDate.push(date.getDate());
        currentDate.push(date.getMonth()+1);
        currentDate.push(date.getUTCFullYear());

        //using the palette model from ./models/palette.js
        
        //saving palette to database and giving a success response
        await PaletteM.create({date:currentDate, palette: palette, searches:(1+searches)})
            .catch(function(err){
                console.error('unsuccessful: ' + '\n' + err);
            });


    },
    incPaletteDB: async function(key){
        

        await PaletteM.find({'palette.keyword': key}).then(function(paletteRecord){
            
            //parses through palette data
            paletteRecord.forEach(async function(data){

                //increasing the amount of searches for the palette
                await PaletteM.updateOne({'palette.keyword': key},{$set: {'searches':((data.searches) +1)}}, {multi: false});
            });      
        }).catch(function(err){
            console.error('error updating palette: ' + err);
        });
        

    },
    getSearches: async function(keyword){
        //this function is called when the palette is definitely in the database
        var searches;
        await PaletteM.find({'palette.keyword': keyword}).then(function(palettes){
            palettes.forEach(function(data){

                searches =  data.searches;
            });

        });
        
        return searches;
    },
    updateFrequentDb: async function(){
        //delete all
        //look for top 10 in palettedb
        //send back all entries in order

        var date = new Date();
        var currentDate = [];
        currentDate.push(date.getDate());
        currentDate.push(date.getMonth()+1);
        currentDate.push(date.getUTCFullYear());

        //await FrequencyM.deleteMany();

        var palettes_dictionary = new Object();
        await PaletteM.find().then(function(palettes){
            palettes.forEach(function(data){

                palettes_dictionary[data.palette.keyword] = data.searches;
            });

        });
        
        palettes_dictionary  = sortDictionary(palettes_dictionary);


        var dictKeys = [];

        //converting dictionary to arrays
        for(var keys in palettes_dictionary){
            dictKeys.push(keys);
        }
        var top_ten_keys = [];
        for(var i = 0; i < dictKeys.length && i < 10; i ++){
            top_ten_keys.push(dictKeys[i]);
        }
        var top_ten = [];

        for(var t = 0; t < top_ten_keys.length; t++){
            await PaletteM.find({ 'palette.keyword': top_ten_keys[t] })
                .then(function(palette){       
                    top_ten.push(palette);
                }).catch(function(err){
                    console.error('error fetching palettes: ' + err);
                });
        }
        
        return top_ten;
    },
    removeFromPaletteDB: async function(key){

        //searches and deletes from palette
        await PaletteM.deleteOne({ 'palette.keyword': key })
            .catch(function(err){
                console.error('unsuccessful: ' + '\n' + err);
            });
    },


    fetchPalette: async function(key){
        var returnedPalette;
        
        //fetching palette from the database
        await PaletteM.find({ 'palette.keyword': key })
            .then(function(palette){       
                palette.forEach(function(data){
                    //getting all the color values in the palette
                    returnedPalette =  (data.palette);
                });
            }).catch(function(err){
                console.error('error fetching palettes: ' + err);
            });
        return returnedPalette;   
    },

    isPaletteStored: async function(key){

        //counts occurrences for the palette
        var count = await PaletteM.countDocuments({ 'palette.keyword': key });
        if(count == 0){
            return false;
        }else{
            return true;
        }
    },

    //this function will return true if the
    //color palette is recent, false if it needs updating
    isPaletteValid: async function(key){
        var valid;
        await PaletteM.find({ 'palette.keyword': key }).then (function(palette){
            
            //getting current date
            var date = new Date();
            var currentMonth = (date.getMonth()+1);
            
            palette.forEach(function(data){
                //comparing the dates
                if(JSON.stringify(data.date[1]) == JSON.stringify(currentMonth)){
                    valid = true;
                }else{
                    valid = false;
                }
                    
            });
        }).catch(function(err){
            console.error('error checking validity: ' + err);
        });


        return valid;

    },
    isUserStored: async function(user){
        //increases the traffic counter for that day
        incTrafficDB();
        //counts occurrences for the user
        var count = await UsersM.countDocuments({ 'user': user });
        if(count == 0){
            return false;
        }else{
            return true;
        }

    },
    addToUserDB: async function(user, keyword){

        //creates new user with given fields
        var date = new Date();
        var currentDate = [];
        currentDate.push(date.getDate());
        currentDate.push(date.getMonth()+1);
        currentDate.push(date.getUTCFullYear());


        await UsersM.create({firstDate:currentDate, latestDate:currentDate, searched: new Searches([keyword]), user: user, usages: 1})
            .catch(function(err){
                console.log('unsuccessful: ' + '\n' + err);
            });
        


    },
    incUserDB: async function(user, keyword){

        //gets current date
        var date = new Date();
        var currentDate = [];
        currentDate.push(date.getDate());
        currentDate.push(date.getMonth()+1);
        currentDate.push(date.getUTCFullYear());
       
        //looks for user
        await UsersM.find({'user':user}).then(function(userRecord){
            
            //checks for the current words held in the user records
            userRecord.forEach(async function(data){
                var user_keywords = data.searched.keywords;
                var counter = 0; 
                await user_keywords.forEach(function(searches){

                    if(searches == keyword){
                        counter ++;
                    }
                });

                //means the key words has not yet been searched
                if(counter == 0){
                    user_keywords.push(keyword);
                }

                //comparing current date to the last recorded date
                if(JSON.stringify(data.latestDate) == JSON.stringify(currentDate)){
                
                    //only adds the keyword and updates usages(meaning the usage was on same day as last day used)
                    await UsersM.updateOne({'user':user},{$set: {'usages':((data.usages) +1),'searched':new Searches(user_keywords)}}, {multi: true});
                }else{
                    
                    //adds keyword to searched keywords, updates the usages and updates the last day using the website
                    await UsersM.updateOne({'user':user},{$set: {'latestDate':currentDate, 'usages':((data.usages) +1), 'searched':new Searches(user_keywords)}}, {multi: true});
                }
            });      
        }).catch(function(err){
            console.error('error updating traffic: ' + err);
        });
    }
};
        