const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const port = process.env.PORT || 5000;

//Middleware
app.use(cors())
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.plp9f.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// console.log(uri)

async function run(){
    try{
        await client.connect();
        console.log('connected to database')
        const database = client.db('helmatesBd');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');
        const usersCollection = database.collection('users')

        // GET API 
        app.get('/products', async(req, res)=>{
            const cursor = productsCollection.find({});
            const products= await cursor.toArray();
            res.send({
                products
            });
        })
         //GET Single product 
            app.get('/products/:id', async(req, res) => {
                const id = req.params.id;
                // console.log('getting searching id', id)
                const query ={_id: ObjectId(id)};
                const product = await productsCollection.findOne(query);
                res.json(product)

            })

            // GET API from All Orders
            app.get('/allorders', async(req, res)=>{
                const email = req.query.email;
                const query = {email:email}
                const cursor = ordersCollection.find(query);
                const products= await cursor.toArray();
                res.send(products);
            })

            // GET API from All Orders
            app.get('/manageOrders', async(req, res)=>{
                const cursor = ordersCollection.find({});
                const products= await cursor.toArray();
                res.send(products);
            })

            app.get('/users/:email', async(req, res)=>{
                const email = req.params.email;
                const query = {email:email};
                const user = await usersCollection.findOne(query);
                let isAdmin = false;
                if(user?.role === 'admin'){
                    isAdmin=true;
                }
                res.json({admin:isAdmin});
            })

        // POST API
        app.post('/products', async(req, res)=>{
            const product = req.body;
            // console.log('Hit the api', product)
            const result = await productsCollection.insertOne(product);
            console.log(result)
            res.json(result)
        });
         // Add Order API
         app.post('/orders', async(req, res)=>{
            const order = req.body;
            // console.log('order', order);
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        })

        // Add Order POST API
        app.post('/orders', async(req, res)=>{
            const order = req.body;
            // console.log('order', order);
            const result = await orderCollection.insertOne(order);
            res.json(result);
        })

        // Add USER POST API
        app.post('/users', async(req, res) =>{
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result)
            res.json(result)
        })

        app.put('/users', async(req, res)=>{
            const user = req.body;
            const filter = {email:user.email};
            const options = {upsert: true};
            const updateDoc = {$set: user};
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result)
        })

        // Make Admin PUT API
        app.put('/users/admin', async(req, res)=>{
            const user = req.body;
            const filter = {email:user.email};
            const updateDoc = {$set: {role: 'admin'}};
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);

        })
 
         //DELETE API
         app.delete('/products/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await productsCollection.deleteOne(query);
            res.json(result);
        })
        // DELETE API 2
        app.delete('/ordered/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })
    }
    finally{
        // await client.close()
    }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello HelmatesBD User!')
})

app.listen(port, () => {
  console.log(`listening at ${port}`)
})