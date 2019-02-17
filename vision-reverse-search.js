'use strict';
let {PythonShell} = require('./node_modules/python-shell/index')

async function tagSearch(imagePath) {
  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  // Performs label detection on the image file
  //const [result] = await client.labelDetection('./wakeupcat.jpg');
  const [result] = await client.labelDetection(imagePath);
  const labels = result.labelAnnotations;
  console.log('Labels:');
  labels.forEach(label => console.log(label.description));
}

//tagSearch('./resources/tree.jpg').catch(console.error);


async function paletteSearch(imagePath){

  // Imports the Google Cloud client library
  const vision = require('@google-cloud/vision');

  // Creates a client
  const client = new vision.ImageAnnotatorClient();

  // Performs label detection on the image file
  //const [result] = await client.labelDetection('./wakeupcat.jpg');

  const [result] = await client.imageProperties(imagePath);
  const colors = result.imagePropertiesAnnotation.dominantColors.colors;
  colors.forEach(color => console.log(color));
  

}

//paletteSearch('./resources/solid-red-test.jpg').catch(console.error);

async function populateImageUrlArray(searchWord)
{
    var imageUrlList = [];
    /*
    const api_key = "aizasyc37-yn0mhrqarsedjbyc3haanmuknnibw";
    const srch_eng_id = "012928527837730696752:wzqnawdyxwc";
    const keyword = "dog";
    var srchrequest = "https://www.googleapis.com/customsearch/v1?key=" + api_key + "&cx=" + srch_eng_id + "&q=" + keyword + "&searchtype=image";

    const request = require('request');

    request(srchrequest, { json: true }, (err, res, body) => {
    if (err) { return console.log(err); }
    console.log(body.items);
    });
    */

    const api_key = "AIzaSyC37-yN0mhRqARSEDJbYC3HaanMUKNNIbw";
    const srch_eng_id = "012928527837730696752:wzqnawdyxwc";
    var srchRequest = "https://www.googleapis.com/customsearch/v1?key=" + api_key + "&cx=" + srch_eng_id + "&q=" + searchWord + "&searchType=image";
 
    const fs = require('fs');
    fs.writeFile('websites.txt', "", (err) => {  
        if (err) throw err;
        console.log('');
    });
    //send srchRequest to parse_json.py and get an array of strings
    //console.log(srchRequest);
    let options = {
        mode: 'text',
        pythonPath: 'C:/Users/eyasv/AppData/Local/Programs/Python/Python37-32/python.exe',
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: '',
        args: [srchRequest]
    };
   
    r = PythonShell.run('parse_json.py', options, function (err, results) {
        if (err) throw err;
        // results is an array consisting of messages collected during execution
        //console.log(results[0]);
     
        let temp_urls = []
        var temp_url =""
        var quote = false;
        //turn into an array
        //console.log(results[0]);
    
        var i;
        for(i =0; i< results[0].length;i++){
        if(results[0].charAt(i) == ','){
            temp_urls.push(temp_url);
            const fs = require('fs');
            fs.appendFile('websites.txt', temp_url + "\n", (err) => {  
                if (err) throw err;
                
            });
            temp_url = ""
        }else{
            temp_url += results[0].charAt(i);
    
        }
        }
        return(temp_urls)
        
    });

    

    return r;
    
}

//var r = populateImageUrlArray("dog"); 
//console.log(r)

var r = function() {
  var fs = require('fs');
  var es = require('event-stream');

  var lines = [];

  var s = fs.createReadStream('websites.txt')
      .pipe(es.split())
      .pipe(es.mapSync(function(line) {
          //pause the readstream
          s.pause();
          lines.push(line);
          s.resume();
      })
      .on('error', function(err) {
          console.log('Error:', err);
      })
      .on('end', function() {
          //console.log('Finish reading.');
          console.log(lines);
      })
  );
  return(lines);


};


console.log(r);