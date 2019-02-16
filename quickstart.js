//async function quickstart(
//    projectId = 'chromacache-231919', // Your Google Cloud Platform project ID
//    bucketName = 'chromacache_bucket' // The name for the new bucket
//  ) {
//    // Imports the Google Cloud client library
//    const {Storage} = require('@google-cloud/storage');
  
    // Creates a client
//    const storage = new Storage({projectId});
  
    // Creates the new bucket
//    await storage.createBucket(bucketName);
//    console.log(`Bucket ${bucketName} created.`);
//  }
'use strict';
var express = require('express');
var quickstart = express();
quickstart.get('/', function(req, res){
    res.status(200).send("Hello from eyas");

});
var server = quickstart.listen(process.env.PORT || '8080', function(){
    console.log("app listening on port %s ", server.address().port);
    console.log('Press CTRL + C to quit');
});
