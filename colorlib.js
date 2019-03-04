/*
* ----------------------------------------------------
* Imports
* ----------------------------------------------------
*/
const fetch = require('node-fetch');
//const vision = require('@google-cloud/vision');

//api_key = "AIzaSyC37-yN0mhRqARSEDJbYC3HaanMUKNNIbw"
//srch_eng_id = "012928527837730696752:wzqnawdyxwc"

class Color{
    constructor(red, green, blue){
        this.red = red;
        this.blue = blue;
        this.green = green;
    }
}

module.exports = {
    fetchImageLinks:function(keyword, api_key, srch_eng_id){

        var srchRequest = 'https://www.googleapis.com/customsearch/v1?key=' + api_key + '&cx=' + srch_eng_id + '&q=' + keyword + '&searchType=image';

        fetch(srchRequest).then(res => res.json())
            .then(searchJSON => {

                var links = [];

                for (var item in searchJSON.items) {
                    console.log(links);
                    links.push(item.link);
                }
                return links;
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
    }
};
        
        
        
 