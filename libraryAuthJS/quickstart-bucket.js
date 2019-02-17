'use strict';

// [START storage_quickstart]
async function quickstart(
  projectId = 'chromacache-231919', // Your Google Cloud Platform project ID
  bucketName = 'chromacache_bucket' // The name for the new bucket
) {
  // Imports the Google Cloud client library
  const {Storage} = require('@google-cloud/storage');

  // Creates a client
  const storage = new Storage({projectId});

  // Creates the new bucket
  await storage.createBucket(bucketName);
  console.log(`Bucket ${bucketName} created.`);
}
// [END storage_quickstart]

const args = process.argv.slice(2);
quickstart(...args).catch(console.error);