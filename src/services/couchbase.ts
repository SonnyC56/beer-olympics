import { connect, Cluster, Bucket, Collection } from 'couchbase';

let cluster: Cluster | null = null;
let bucket: Bucket | null = null;

export async function getCouchbaseConnection() {
  if (!cluster) {
    const connectionString = process.env.COUCHBASE_CONNECTION_STRING || 'couchbase://localhost';
    const username = process.env.COUCHBASE_USERNAME || 'Administrator';
    const password = process.env.COUCHBASE_PASSWORD || 'password';
    
    cluster = await connect(connectionString, {
      username,
      password,
    });
  }
  
  if (!bucket) {
    bucket = cluster.bucket(process.env.COUCHBASE_BUCKET || 'beer_olympics');
  }
  
  return { cluster, bucket };
}

export async function getCollection(collectionName = '_default'): Promise<Collection> {
  const { bucket } = await getCouchbaseConnection();
  return bucket.defaultScope().collection(collectionName);
}

export async function closeConnection() {
  if (cluster) {
    await cluster.close();
    cluster = null;
    bucket = null;
  }
}