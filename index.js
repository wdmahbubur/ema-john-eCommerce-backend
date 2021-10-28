const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const dbUsername = process.env.DB_USER;
const dbPassword = process.env.DB_PASS;

app.get('/', (req, res) => {
    res.send("ema-jhon server running");
})

const uri = `mongodb+srv://${dbUsername}:${dbPassword}@cluster0.ni4ot.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();

        const database = client.db("ema-john-e-commerce");
        const productsCollection = database.collection("products");
        const orderCollection = database.collection("orders");
        console.log("function enter")

        //GET products
        app.get('/products', async (req, res) => {
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const cursor = productsCollection.find({});
            const count = await cursor.count();
            let products;
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            } else {
                products = await cursor.toArray()
            }
            res.send({
                count,
                products
            });
        })

        //GET cart items
        app.post('/products/cartItem', async (req, res) => {
            const keys = req.body;
            const query = { key: { $in: keys } };
            const products = await productsCollection.find(query).toArray();
            res.json(products);
        })

        //Post Order
        app.post('/order', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.send(result);
        })

    }
    finally {

    }
}
run().catch(console.dir);

app.listen(port, console.log("Server Running..."));