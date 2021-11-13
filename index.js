const express = require('express');
const app = express()
const cors = require('cors');
// const admin = require("firebase-admin");
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.eammk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('vision-world');
        const productCollection = database.collection('camera');
        const ordersCollection = database.collection("orders");
        const reviewCollection = database.collection("review");
        const userCollection = database.collection("users");

        // Product 
        app.post("/addProducts", async (req, res) => {
            console.log(req.body)
            const products = req.body;
            const result = await productCollection.insertOne(products);
            res.json(result)

        })

        app.get("/allProducts", async (req, res) => {
            const result = await productCollection.find({}).toArray();
            res.json(result);
        });


        // Product Details
        app.get("/singleDetails/:id", async (req, res) => {
            console.log(req.params.id);
            const result = await productCollection
                .find({ _id: ObjectId(req.params.id) })
                .toArray();
            res.send(result[0]);
            console.log(result);
        });


        // Orders
        app.post("/addOrders", async (req, res) => {
            const result = await ordersCollection.insertOne(req.body);
            res.json(result);
        });

        app.get("/myorder/:email", async (req, res) => {
            const result = await ordersCollection
                .find({ email: req.params.email })
                .toArray();
            res.send(result);
        });

        // Review
        app.post("/addreview", async (req, res) => {
            const result = await reviewCollection.insertOne(req.body);
            res.send(result);
        });

        app.get("/allreview", async (req, res) => {
            const result = await reviewCollection.find({}).toArray();
            res.json(result);
        });

        // Users
        app.post("/adduser", async (req, res) => {
            console.log(req.body)
            const result = await userCollection.insertOne(req.body);
            res.json(result);
        });

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

        app.put('/adduser', async (req, res) => {
            const user = req.body;
            console.log("put", user)
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        // Make Admin

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
            // const requester = req.decodedEmail;
            // if (requester) {
            //     const requesterAccount = await userCollection.findOne({ email: requester });
            //     if (requesterAccount.role === 'admin') {
            //         const filter = { email: user.email };
            //         const updateDoc = { $set: { role: 'admin' } };
            //         const result = await userCollection.updateOne(filter, updateDoc);
            //         res.json(result);
            //     }
            // }
            // else {
            //     res.status(403).json({ message: 'you do not have access to make admin' })
            // }

        })

        /// all order
        app.get("/allOrders", async (req, res) => {
            // console.log("hello");
            const result = await ordersCollection.find({}).toArray();
            res.send(result);
        });

        // status update
        app.put("/statusUpdate/:id", async (req, res) => {
            const filter = { _id: ObjectId(req.params.id) };
            console.log(req.params.id);
            const result = await ordersCollection.updateOne(filter, {
                $set: {
                    status: req.body.status,
                },
            });
            res.send(result);
            console.log(result);
        });

    }


    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello nahid')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})