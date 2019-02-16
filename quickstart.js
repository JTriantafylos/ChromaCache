async function quickstart(
    projectId = 'YOUR_PROJECT_ID', // Your Google Cloud Platform project ID
    bucketName = 'my-new-bucket' // The name for the new bucket
  ) {
    // Imports the Google Cloud client library
    const {Storage} = require('@google-cloud/storage');
  
    // Creates a client
    const storage = new Storage({projectId});
  
    // Creates the new bucket
    await storage.createBucket(bucketName);
    console.log(`Bucket ${bucketName} created.`);
  }