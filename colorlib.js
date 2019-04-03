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


// Creates a Google Vision image annotator client with the given service key
const imageClient = new vision.ImageAnnotatorClient({
    keyFilename: './secure/chromacache-d98d5cf45be5.json'
});

//A color that doesn't have a Harmonies parameter
class SubColor{

    //constructor for color
    constructor(rgb){    
        this.RGB = rgb;

    }
    getRGB(){
        return this.RGB;
    }

}

//A palette that doesn't require a keyword and is filled with subcolors
class SubPalette{
    constructor(subcolors){
        this.subcolors = subcolors;
    }
    addSubColor(subcolor){
        this.subcolors.push(subcolor);
    }
    getSubColor(index){
        return (this.subcolors[index]);
    }

}
//Harmonies holds sub palettes of different sizes based on the needs
class Harmonies{
    constructor(subpalettes){
        this.subpalettes = subpalettes;
    }
    addSubPalette(subpalette){
        this.subpalettes.push(subpalette);
    }
    getSubPalette(index){
        return (this.subpalettes[index]);
    }
}

//this color class will also hold sub palettes
class Color{
    //rgb in int array
    //complimentary and contrasting are SubPalettes
    constructor(rgb, harmonies){
        this.rgb = rgb;
        this.harmonies = harmonies;

    }

}

class Palette{
    //constructor for palette
    //keyword is string
    //colors is a SubColor array
    constructor(keyword, colors){
        this.keyword = keyword;
        this.colors = colors;
    }


    addColor(color){
        this.colors.push(color);
    }

}
//holds the searched keywords of the user
class Searches{
    constructor(keywords){
        this.keywords = keywords;
    }

    addKeyWord(keyword){
        this.keywords.push(keyword);
    }

}

function createHarmonies(RGB){
    var temp = new Harmonies([]);
    temp.addSubPalette(new SubPalette(createComplementaryPalette(RGB)));
    temp.addSubPalette(new SubPalette(createTetradicPalette(RGB)));
    temp.addSubPalette(new SubPalette(createTriadicPalette(RGB)));
    temp.addSubPalette(new SubPalette(createAnalogousPalette(RGB)));
    temp.addSubPalette(new SubPalette(createSplitComplementaryPalette(RGB)));
    temp.addSubPalette(new SubPalette(createTintShadeMap(RGB)));
    
    return temp;
}

function createComplementaryPalette(RGB){
    var subP = new SubPalette([]);
    subP.addSubColor(new SubColor(RGB));
    var newRGB = [];

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
   
    subP.addSubColor(new SubColor(newRGB));
    
    return (subP);
}
function createTetradicPalette(RGB){
    var tempSubP = createComplementaryPalette(RGB);
    var temp = [];
    temp.push(RGB[1]);
    temp.push(RGB[2]);
    temp.push(RGB[0]);

    tempSubP.addSubColor(new SubColor(temp));
    var tempLast = temp;
    if(temp[0] >= temp[1] && temp[0] >= temp[2]){
        //0 index has largest RGB value
        if(temp[1] <= temp[2]){
            //1 index has smallest value
            tempSubP.addSubColor(new SubColor([temp[1], temp[0], ((temp[0]+temp[1])-temp[2])]));

        }else{
            //2 index has smallest value
            tempSubP.addSubColor(new SubColor([temp[2], ((temp[0]+temp[2])-temp[1]), temp[0]]));
        }

    }else if(temp[1] > temp[0] && temp[1] >= temp[2]){
        //1 index has largest RGB value
        if(temp[0] <= temp[2]){
            //0 index has smallest value
            tempSubP.addSubColor(new SubColor([temp[1], temp[0], ((temp[1]+temp[0])-temp[2])]));
        }else{
            //2 index has smallest value
            tempSubP.addSubColor(new SubColor([((temp[1]+temp[2])-temp[0]), temp[2], temp[1]]));
        }

    }else if(temp[2] > temp[1] && temp[2] > temp[0]){
        //2 index has largest RGB value
        if(temp[0] <= temp[1]){
            //0 index has smallest value
            tempSubP.addSubColor(new SubColor([temp[2], ((temp[2]+temp[0])-temp[1]), temp[0]]));
        }else{
            //1 index has smallest value
            tempSubP.addSubColor(new SubColor([((temp[1]+temp[2])-temp[0]), temp[2], temp[1]]));
        }

    }
    return (tempSubP);


}
function createTriadicPalette(RGB){
    var subP = new SubPalette([]);
    subP.addSubColor(new SubColor(RGB));

    subP.addSubColor(new SubColor([RGB[1], RGB[2], RGB[0]]));
    
    subP.addSubColor(new SubColor([RGB[2], RGB[0], RGB[1]]));

    return subP;

}
function createAnalogousPalette(RGB){
    var delta;
    var phi;
    var theta;
    var subP = new SubPalette([]);
    subP.addSubColor(new SubColor(RGB));
    if(RGB[0] >= RGB[1] && RGB[0] >= RGB[2]){
        //0 index has largest RGB value
        if(RGB[1] <= RGB[2]){
            //1 index has smallest value
            delta = RGB[2] - ((RGB[0] + RGB[1])/2);

            if(delta >0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[0] - delta;
                theta = RGB[1] + delta;

                subP.addSubColor(new SubColor([phi, RGB[1], RGB[0]]));
                subP.addSubColor(new SubColor([RGB[0], RGB[1], theta]));

            }else if (delta < 0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[0] - delta;
                theta = RGB[1] + delta;

                subP.addSubColor(new SubColor([RGB[0], theta, RGB[1]]));
                subP.addSubColor(new SubColor([RGB[0], RGB[1], phi]));
            }else{
                subP.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
                subP.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
            }
            
        }else{
            //2 index has smallest value
            delta = RGB[1] - ((RGB[0] + RGB[2])/2);
            if(delta >0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[0] - delta;
                theta = RGB[2] + delta;

                subP.addSubColor(new SubColor([phi, RGB[0], RGB[2]]));
                subP.addSubColor(new SubColor([RGB[0], theta, RGB[2]]));

            }else if (delta < 0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[0] - delta;
                theta = RGB[2] + delta;

                subP.addSubColor(new SubColor([RGB[0], RGB[2], theta]));
                subP.addSubColor(new SubColor([RGB[0], phi, RGB[2]]));
            }else{
                subP.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
                subP.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
            }
        }

    }else if(RGB[1] > RGB[0] && RGB[1] >= RGB[2]){
        //1 index has largest RGB value
        if(RGB[0] <= RGB[2]){
            //0 index has smallest value
            delta = RGB[2] - ((RGB[1] + RGB[0])/2);
            if(delta >0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[1] - delta;
                theta = RGB[0] + delta;

                subP.addSubColor(new SubColor([RGB[0], phi, RGB[1]]));
                subP.addSubColor(new SubColor([RGB[0], RGB[1], theta]));

            }else if (delta < 0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[1] - delta;
                theta = RGB[0] + delta;

                subP.addSubColor(new SubColor([theta, RGB[1], RGB[0]]));
                subP.addSubColor(new SubColor([RGB[0], RGB[1], phi]));
            }else{
                subP.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
                subP.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
            }

        }else{
            //2 index has smallest value
            delta = RGB[0] - ((RGB[1] + RGB[2])/2);
            if(delta >0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[1] - delta;
                theta = RGB[2] + delta;

                subP.addSubColor(new SubColor([RGB[1], phi, RGB[2]]));
                subP.addSubColor(new SubColor([theta, RGB[1], RGB[2]]));

            }else if (delta < 0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[1] - delta;
                theta = RGB[2] + delta;

                subP.addSubColor(new SubColor([RGB[2], RGB[1], theta]));
                subP.addSubColor(new SubColor([phi, RGB[1], RGB[2]]));
            }else{
                subP.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
                subP.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
            }

        }

    }else if(RGB[2] > RGB[1] && RGB[2] > RGB[0]){
        //2 index has largest RGB value
        if(RGB[0] <= RGB[1]){
            //0 index has smallest value
            delta = RGB[1] - ((RGB[2] + RGB[0])/2);
            if(delta >0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[2] - delta;
                theta = RGB[0] + delta;

                subP.addSubColor(new SubColor([RGB[0], RGB[2], phi]));
                subP.addSubColor(new SubColor([RGB[0], theta, RGB[2]]));

            }else if (delta < 0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[2] - delta;
                theta = RGB[0] + delta;

                subP.addSubColor(new SubColor([theta, RGB[0], RGB[2]]));
                subP.addSubColor(new SubColor([RGB[0], phi, RGB[2]]));
            }else{
                subP.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
                subP.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
            }

        }else{
            //1 index has smallest value 
            delta = RGB[0] - ((RGB[2] + RGB[1])/2);
            if(delta >0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[2] - delta;
                theta = RGB[1] + delta;

                subP.addSubColor(new SubColor([RGB[2], RGB[1], phi]));
                subP.addSubColor(new SubColor([theta, RGB[1], RGB[2]]));

            }else if (delta < 0){
                delta = Math.round(Math.abs(delta));
                phi = RGB[2] - delta;
                theta = RGB[1] + delta;

                subP.addSubColor(new SubColor([RGB[1], theta, RGB[2]]));
                subP.addSubColor(new SubColor([phi, RGB[1], RGB[2]]));
            }else{
                subP.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
                subP.addSubColor(new SubColor([RGB[0], RGB[1], RGB[2]]));
            }

        }

    }

    return subP;

}
function createSplitComplementaryPalette(RGB){
    
    var analog = createAnalogousPalette(RGB);
    var subP = new SubPalette([]);

    subP.addSubColor(new SubColor(RGB));
    subP.addSubColor(createComplementaryPalette(analog.getSubColor(1).getRGB()).getSubColor(1));
    subP.addSubColor(createComplementaryPalette(analog.getSubColor(2).getRGB()).getSubColor(1));
    return subP;
    
    
}

function createTintShadeMap(RGB){
    var delta = 255 - RGB[0];
    var rho = 255 - RGB[1];
    var pi = 255 - RGB[2];
    
    var phi;
    var theta;
    var omega;

    var subP = new SubPalette([]);

    //generating shades (adding 'black')
    var i;
    for (i = 0; i < 3; i++){
        phi = Math.round(((1+i)/4) *RGB[0]);
        theta = Math.round(((1+i)/4) * RGB[1]);
        omega = Math.round(((1+i)/4) * RGB[2]);

        subP.addSubColor(new SubColor([phi,theta, omega]));

    }
    subP.addSubColor(new SubColor(RGB));
    var i;
    for (i = 0; i < 3; i++){
        phi = Math.round((delta *((1+i)/4)) + RGB[0]);
        theta = Math.round((rho *((1+i)/4)) + RGB[1]);
        omega = Math.round((pi *((1+i)/4)) + RGB[2]);
        
        subP.addSubColor(new SubColor([phi,theta, omega]));

    }
    return subP;
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
        currentDate.push(date.getMonth()+1);
        currentDate.push(date.getUTCFullYear());

        //using the palette model from ./models/palette.js
        
        //saving palette to database and giving a success responce
        PaletteM.create({date:currentDate, palette: palette})
            .catch(function(err){
                console.error('unsuccessful: ' + '\n' + err);
            });


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

    incToTrafficDB: async function(){
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
        