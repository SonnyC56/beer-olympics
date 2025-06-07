import { connect, Cluster, Bucket, Collection, QueryResult } from 'couchbase';

let cluster: Cluster | null = null;
let bucket: Bucket | null = null;
let isConnecting = false;

export class CouchbaseError extends Error {
  public code?: string;
  
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'CouchbaseError';
    this.code = code;
  }
}

export async function getCouchbaseConnection() {
  if (cluster && bucket) {
    return { cluster, bucket };
  }

  if (isConnecting) {
    // Wait for ongoing connection
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (cluster && bucket) {
      return { cluster, bucket };
    }
  }

  isConnecting = true;
  
  try {
    const connectionString = process.env.COUCHBASE_CONNECTION_STRING;
    const username = process.env.COUCHBASE_USERNAME;
    const password = process.env.COUCHBASE_PASSWORD;
    const bucketName = process.env.COUCHBASE_BUCKET || 'beer_olympics';
    
    if (!connectionString || !username || !password) {
      throw new CouchbaseError('Missing Couchbase configuration. Please check environment variables.');
    }
    
    cluster = await connect(connectionString, {
      username,
      password,
      timeouts: {
        kvTimeout: 10000,
        queryTimeout: 20000,
        connectTimeout: 10000,
        managementTimeout: 20000,
      },
    });
    
    bucket = cluster.bucket(bucketName);
    
    // Wait for bucket to be ready
    await bucket.defaultCollection().exists('test', { timeout: 1000 }).catch(() => {});
    
    return { cluster, bucket };
  } catch (error) {
    cluster = null;
    bucket = null;
    throw new CouchbaseError(`Failed to connect to Couchbase: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    isConnecting = false;
  }
}

export async function getCollection(collectionName = '_default'): Promise<Collection> {
  const { bucket } = await getCouchbaseConnection();
  return bucket.defaultScope().collection(collectionName);
}

export async function query(statement: string, options?: any): Promise<QueryResult> {
  const { cluster } = await getCouchbaseConnection();
  return cluster.query(statement, options);
}

export async function closeConnection() {
  if (cluster) {
    await cluster.close();
    cluster = null;
    bucket = null;
  }
}

// Helper functions for common operations
export async function getDocument(key: string, collection = '_default') {
  try {
    const coll = await getCollection(collection);
    const result = await coll.get(key);
    return result.content;
  } catch (error) {
    if (error instanceof Error && error.name === 'DocumentNotFoundError') {
      return null;
    }
    throw new CouchbaseError(`Failed to get document ${key}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function upsertDocument(key: string, value: any, collection = '_default') {
  try {
    const coll = await getCollection(collection);
    const result = await coll.upsert(key, value);
    return result;
  } catch (error) {
    throw new CouchbaseError(`Failed to upsert document ${key}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function removeDocument(key: string, collection = '_default') {
  try {
    const coll = await getCollection(collection);
    const result = await coll.remove(key);
    return result;
  } catch (error) {
    if (error instanceof Error && error.name === 'DocumentNotFoundError') {
      return null;
    }
    throw new CouchbaseError(`Failed to remove document ${key}: ${error instanceof Error ? error.message : String(error)}`);
  }
}