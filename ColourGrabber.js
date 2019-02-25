//api_key = "AIzaSyC37-yN0mhRqARSEDJbYC3HaanMUKNNIbw"
//srch_eng_id = "012928527837730696752:wzqnawdyxwc"

const fetch = require('node-fetch');

//module.exports = {
function fetchColour (keyword, api_key, srch_eng_id){
        
        var srchRequest = "https://www.googleapis.com/customsearch/v1?key=" + api_key + "&cx=" + srch_eng_id + "&q=" + keyword + "&searchType=image";
        var tempJS;
        return(fetch(srchRequest)
        .then(res => res.json())
        .then(function(json){
               tempJS = (json);
               items = tempJS.items;
               itemsLength = items.length;
               URLS = [];
               var i;
               for(i = 0; i <itemsLength; i ++){
                       URLS.push(items[i].link);
               }
               console.log(URLS);
                   
        }).catch(function(error) {
                console.log('Error: ', error);
        })
        );
        
      
       
        
}

var alo = fetchColour('red', 'AIzaSyC37-yN0mhRqARSEDJbYC3HaanMUKNNIbw','012928527837730696752:wzqnawdyxwc');
console.log(alo);
