'use strict';

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

async function get_palette_Link(keyword){

  const api_key = "AIzaSyC37-yN0mhRqARSEDJbYC3HaanMUKNNIbw";
  const srch_eng_id = "012928527837730696752:wzqnawdyxwc";
  var srchRequest = "https://www.googleapis.com/customsearch/v1?key=" + api_key + "&cx=" + srch_eng_id + "&q=" + keyword + "&searchType=image";
  return(srchRequest)
}
googlePalatte("dog"); 