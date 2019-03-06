/*
* ----------------------------------------------------
* Imports
* ----------------------------------------------------
*/
const fetch = require('node-fetch');
const mongoose = require('mongoose');

//mongoose.connect('mongodb')
//const vision = require('@google-cloud/vision');

//api_key = "AIzaSyC37-yN0mhRqARSEDJbYC3HaanMUKNNIbw"
//srch_eng_id = "012928527837730696752:wzqnawdyxwc"

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
            var outp = 'The RGB is'+' Red : ' + this.red + ', Green: ' + this.green + ', Blue: ' + this.blue;
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

    addColors(color){

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

//  var forest = new Color(34,139,34);
//  console.log(forest.getRGB());
//  console.log(forest.toString());

//  var lime = new Color(0,128,0);


//  var cols  = [forest, lime];
//  var pal = new Palette('green',cols);

//  console.log(pal.toString());
//  pal.addColors(lime);
//  console.log(pal);

module.exports = {
    fetchImageLinks:function(keyword, api_key, srch_eng_id){

        //search request from the custom GSE(Google search engine)
        var srchRequest = 'https://www.googleapis.com/customsearch/v1?key=' + api_key + '&cx=' + srch_eng_id + '&q=' + keyword + '&searchType=image';

        //fetch from node-fetch
        fetch(srchRequest).then(res => res.json())
            .then(function(json) {
                //got json, now splitting into separate URL's
                
                //splitting json into elements
                items = json.items;
                itemsLength = items.length;
                
                
                //holds the URL's
                URLS = [];


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

    fetchDominantColorPalette:function(imageLinks){
        var dominantPalette;
        
        //const imageClient = new vision.ImageAnnotatorClient({
        //    keyFilename: './secure/chromacache-d98d5cf45be5.json'    
        //});

        //const [result] = await imageClient.imageProperties(
        //    'd'
        //);

        return dominantPalette;
    },

    addToDB: function (palette){
       
    }
};
        
        
        
 