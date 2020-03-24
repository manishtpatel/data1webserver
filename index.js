// States
//  1. Import Data from Source


const express = require('express')
const bodyParser = require('body-parser');
var proxy = require('express-http-proxy');

const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/public', express.static('public'))

app.use('/proxy', proxy('localhost:8080', {
    userResHeaderDecorator(headers, userReq, userRes, proxyReq, proxyRes) {
        // recieves an Object of headers, returns an Object of headers.
        headers['Access-Control-Allow-Origin'] = "*"
        headers['Access-Control-Allow-Headers'] = "Origin, X-Requested-With, Content-Type, Accept"

        return headers;
    }
}));

const port = 3000

const MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID
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
        state: 1,
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

app.get('/getproduct/:productId', async (req, res, next) => {
    try {
        let productId = req.params["productId"]
        var objectId = new ObjectID(productId);

        console.log(productId)

        let result = await collection_products.find({ _id: objectId }).toArray()
        res.send(result);
    } catch (err) {
        console.error(err)
        next(err)
    }
})

app.post('/updatestatus', async (req, res, next) => {
    try {
        let state = parseFloat(req.body["state"])
        let productId = req.body["productId"]
        var objectId = new ObjectID(productId);

        console.log(state, productId)

        await collection_products.findOneAndUpdate({ _id: objectId }, { '$set': { state } })

        res.send({ 'good': 'yes' })
    } catch (err) {
        console.error(err)
        next(err)
    }
})

app.post('/productdata', async (req, res, next) => {
    try {
        let SaleCondition = req.body["SaleCondition"]
        let productId = req.body["productId"]
        var objectId = new ObjectID(productId);

        console.log(SaleCondition, productId)

        await collection_products.findOneAndUpdate({ _id: objectId }, { '$set': { SaleCondition } })

        res.send({ 'good': 'yes' })
    } catch (err) {
        console.error(err)
        next(err)
    }
})


app.listen(port, () => console.log(`Example app listening on port ${port}!`))