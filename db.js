const { MongoClient } = require('mongodb');

const uri = 'mongodb+srv://dbclusteruser:dbcluster@dbcluster.4pxvp.mongodb.net/?retryWrites=true&w=majority&appName=dbcluster';
const dbName = 'logindb';

async function connect() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db(dbName);
        return db;
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        throw err;
    }
}

module.exports = connect;
