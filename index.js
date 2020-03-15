const express = require('express')
const bodyParser = require('body-parser');

const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const port = 3000

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'myproject';

// Create a new MongoClient
const client = new MongoClient(url);

var collection_products;

// Use connect method to connect to the Server
client.connect(function (err) {
    assert.equal(null, err);
    console.log("Connected successfully to server");

    const db = client.db(dbName);

    collection = db.collection('Processes');
    collection_products = db.collection('Products');

    // client.close();
});

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});


app.get('/', (req, res) => res.send('GST Server Up!'))

app.get('/process', (req, res) => {
    collection.find({}).toArray(function (err, docs) {
        assert.equal(err, null);
        console.log("Found the following records");
        console.log(docs)
        callback(docs);
    });
})

app.get('/process_update', (req, res) => {
    collection.insertMany([
        { a: 1 }, { a: 2 }, { a: 3 }
    ], function (err, result) {
        assert.equal(err, null);
        assert.equal(3, result.result.n);
        assert.equal(3, result.ops.length);
        console.log("Inserted 3 documents into the collection");
        callback(result);
    });
})

app.post('/addproduct', (req, res) => {
    let name = req.body["name"];

    collection_products.insertMany([{
        name,
        timestamp: Date.now(),
    }]);

    res.send();
})

app.get('/getproducts', async (req, res, next) => {
    try {
        let result = await collection_products.find().sort({ timestamp: -1 }).limit(5).toArray()
        res.send(result);
    } catch (err) {
        console.error(err)
        next(err)
    }
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))