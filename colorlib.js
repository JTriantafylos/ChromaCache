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
    harmony.addSubPalette(new SubPalette(createTetradicPalette(RGB)));
    harmony.addSubPalette(new SubPalette(createTriadicPalette(RGB)));
    harmony.addSubPalette(new SubPalette(createAnalogousPalette(RGB)));
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
    var i;
    for (i = 0; i < 3; i++){
        phi = Math.round((delta *((1+i)/4)) + RGB[0]);
        theta = Math.round((rho *((1+i)/4)) + RGB[1]);
        omega = Math.round((pi *((1+i)/4)) + RGB[2]);
        
        subPalette.addSubColor(new SubColor([phi,theta, omega]));

    }
    return subPalette;
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
    addToPaletteDB: function (palette){
        
        //getting date of search
        var date = new Date();
        var currentDate = [];
        currentDate.push(date.getDate());
        currentDate.push(date.getMonth()+1);
        currentDate.push(date.getUTCFullYear());

        //using the palette model from ./models/palette.js
        
        //saving palette to database and giving a success responce
        PaletteM.create({date:currentDate, palette: palette, searches:1})
            .catch(function(err){
                console.error('unsuccessful: ' + '\n' + err);
            });


    },
    incPaletteDB: async function(key){
        

        await PaletteM.find({'palette.keyword': key}).then(function(paletteRecord){
            
            //parses through palette data
            paletteRecord.forEach(async function(data){

                //increasing the amount of searches for the palette
                var searchesVal = data.searches;
                await PaletteM.updateOne({'palette.keyword': key},{$set: {'searches':(searchesVal +1)}}, {multi: false});
            });      
        }).catch(function(err){
            console.error('error updating palette: ' + err);
        });

    },
    updateFrequentDb: async function(palette){
        var count = await FrequencyM.countDocuments({ 'palette.keyword': palette.keyword });
        var length = await FrequencyM.countDocuments();

        var date = new Date();
        var currentDate = [];
        currentDate.push(date.getDate());
        currentDate.push(date.getMonth()+1);
        currentDate.push(date.getUTCFullYear());
        if(length <10 && count == 0){

            //if there are less than 10 entries in the frequency database
            //just append the new palette to the end of the database
            FrequencyM.create({date_added:currentDate, date_latest:currentDate, palette: palette, searches:1})
                .catch(function(err){
                    console.error('unsuccessful: ' + '\n' + err);
                });
        }else{
            if(count == 0){
            
                //check to see if it can replace one;

                //WIP
                //check how many searches are in  palettedb
                var searchesVal;
                var searchesFVal = [];
                await PaletteM.find({'palette.keyword': palette.keyword}).then(function(paletteRecord){
                    
                    //parses through palette data
                    paletteRecord.forEach(async function(data){
        
                        //increasing the amount of searches for the palette
                        searchesVal = data.searches;
                    });      
                }).catch(function(err){
                    console.error('error: ' + err);
                });

                //check if the searches are now higher than the lowest in frequency
                await FrequencyM.find().then(function(frequencyRecord){
                        
                    //parses through palette data
                    frequencyRecord.forEach(async function(data){
            
                        //increasing the amount of searches for the palette
                        searchesFVal.push(data.searches);
                    });      
                }).catch(function(err){
                    console.error('error: ' + err);
                });
                var min = Math.min.apply(Math, searchesFVal);
                var lowestVals = [];
                await FrequencyM.find({'searches': min}).then(function(res){
                    res.forEach(async function(data){
            
                        //collecting the amount of palettes with the same amount of searches
                        lowestVals.push(data);
                    });     
                    
                });

                
                if(searchesVal>min){
                    //if true, remove lowest and add the new one


                    //only use the first index, this also means that
                    //if there are only one index, the first one wont cause errors
                    FrequencyM.deleteOne({ 'palette.keyword':  lowestVals[0].palette.keyword })
                    .catch(function(err){
                        console.error('unsuccessful: ' + '\n' + err);
                    });

                    //add the new palette to frequent database
                    FrequencyM.create({date_added:currentDate, date_latest:currentDate, palette: palette, searches:searchesVal})
                    .catch(function(err){
                        console.error('unsuccessful: ' + '\n' + err);
                    });

                }
                    
            }else{
    
               
                //update the one already in there
                await FrequencyM.find({'palette.keyword': palette.keyword}).then(function(frequencyRecord){
                    
                    //parses through palette data
                    frequencyRecord.forEach(async function(data){
        
                        //increasing the amount of searches for the palette
                        var searchesVal = data.searches;
                        await FrequencyM.updateOne({'palette.keyword': palette.keyword},{$set: {'date_latest':currentDate, 'searches': searchesVal+1}}, {multi: true});
                    });      
                }).catch(function(err){
                    console.error('error updating palette: ' + err);
                });
    
            }
        }
        
        
    },
    getFrequencyOrder:function(){

    },
    removeFromPaletteDB: function(key){

        //searches and deletes from palette
        PaletteM.deleteOne({ 'palette.keyword': key })
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
            var currentDate = [];
            currentDate.push(date.getDate());
            currentDate.push(date.getMonth()+1);
            currentDate.push(date.getUTCFullYear());

            palette.forEach(function(data){
    
                //comparing the dates
    
                if(JSON.stringify(data.date) == JSON.stringify(currentDate)){
                    
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

        //counts occurrences for the user
        var count = await UsersM.countDocuments({ 'user': user });
        if(count == 0){
            return false;
        }else{
            return true;
        }
    },
    addToUserDB: function(user, keyword){

        //creates new user with given fields
        var date = new Date();
        var currentDate = [];
        currentDate.push(date.getDate());
        currentDate.push(date.getMonth()+1);
        currentDate.push(date.getUTCFullYear());


        UsersM.create({firstDate:currentDate, latestDate:currentDate, searched: new Searches([keyword]), user: user, usages: 1})
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
                var temp = data.searched.keywords;
                var counter = 0; 
                await temp.forEach(function(searches){

                    if(searches == keyword){
                        counter ++;
                    }
                });

                //means the key words has not yet been searched
                if(counter == 0){
                    temp.push(keyword);
                }

                //comparing current date to the last recorded date
                if(JSON.stringify(data.latestDate) == JSON.stringify(currentDate)){
                    
                    //adds keyword to searched keywords and updates the usages
                    await UsersM.updateOne({'user':user},{$set: {'usages':(data.usages +1),'searched':new Searches(temp)}}, {multi: true});
                }else{
                    
                    //only adds the keyword(meaning the search was on same day as last day used)
                    await UsersM.updateOne({'user':user},{$set: {'latestDate':currentDate, 'searched':new Searches(temp)}}, {multi: true});
                }
            });      
        }).catch(function(err){
            console.error('error updating traffic: ' + err);
        });
    },

    incTrafficDB: async function(){
        var date = new Date();
        var currentDate = [];
        currentDate.push(date.getDate());
        currentDate.push(date.getMonth()+1);
        currentDate.push(date.getUTCFullYear());
    
        await TrafficM.find({'date':currentDate}).then(function(traffic){

            //checking to see if there has been any traffic
            if(traffic.length == 0){
                
                //if there is no traffic, create an instance for the day
                TrafficM.create({'date':currentDate, 'traffic': 1});
            }
            traffic.forEach(async function(data){  

                //checks again to see if there was traffic on that day
                if(JSON.stringify(data.date) == JSON.stringify(currentDate)){
                    
                    //increases how much traffic
                    await TrafficM.updateOne({'date':currentDate},{$set: {'traffic':(data.traffic +1)}}, {multi: false});
                }else{

                    //create an instance for the day
                    TrafficM.create({'date':currentDate, 'traffic': 1});
                }
            });
        }).catch(function(err){
            console.error('error updating traffic: ' + err);
        }); 
    }
};
        