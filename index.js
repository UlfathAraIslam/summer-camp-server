const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
// const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// const verifyJWT = (req, res, next) => {
//   const authorization = req.headers.authorization;
//   if(!authorization){
//     return res.status(401).send({error: true, message: 'unauthorized access'});
//   }
//   const token = authorization.split(' ')[1];

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
//     if(err) {
//       return res.status(401).send({ error: true, message: 'unauthorized access'})
//     }
//     req.decoded = decoded;
//     next();
//   })
// }

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ukgtyy4.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db("summerCamp").collection("users");
    const classesCollection = client.db("summerCamp").collection("classes");
    const selectedClassesCollection = client.db("summerCamp").collection("selectedClasses");

    // jwt api
    // app.post('/jwt', (req, res) => {
    //   const user = req.body;
    //   const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' }) 
    //   res.send({token});
    // })

    // users collection

    app.get('/users', async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    })

    app.post('/users', async(req,res) => {
      const user = req.body;
      console.log(user);
      const query = {email: user.email}
      const existingUser = await usersCollection.findOne(query);
      // console.log('existing user',existingUser);

      if(existingUser){
        return res.send({message: 'user already exists'})
      }
      const result = await usersCollection.insertOne(user);
      res.send(result);
    })

    // admin

    // app.get('/users/admin/:email', verifyJWT, async(req, res) => {
    //   const email = req.params.email;

    //   if(req.decoded.email !== email){
    //     res.send({admin: false})
    //   }
    //   const query = {email: email}
    //   const user = await usersCollection.findOne(query);
    //   const result = {admin: user?.role === 'admin'}
    //   res.send(result);
    // })

    // TODO: admin
    // app.patch('/users/admin/:id', async(req, res) => {
    //   const id = req.params.id;
    //   console.log(id);
    //   const filter  = {_id: new ObjectId(id)};
    //   const updateDoc = {
    //     $set: {
    //       role: 'admin'
    //     },
    //   };
      
    //   const result = await usersCollection.updateOne(filter, updateDoc);
    //   res.send(result);
    // })

    app.get('/classes', async(req,res) => {

        const result = await classesCollection.find().toArray();
        res.send(result);
    })

    // selected classes collection
    app.get('/selectedClasses', async(req, res) => {
      const email = req.query.email;
      if(!email){
        return res.send([])
      }

      // const decodedEmail = req.decoded.email;
      // if(email !== decodedEmail){
      //   return res.status(403).send({error: true, message: 'forbiden access'})
      // }


      const query = {email: email};
      const result = await selectedClassesCollection.find(query).toArray();
      res.send(result);
    })


    app.post('/selectedClasses', async(req,res) => {
      const item = req.body;
      console.log(item);
      const result = await selectedClassesCollection.insertOne(item);
      res.send(result);
    })

    app.delete('/selectedClasses/:id', async(req,res) => {
      const id = req.params.id;
      const query ={_id: new ObjectId(id)};
      const result = await selectedClassesCollection.deleteOne(query);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get ('/', (req, res) => {
    res.send('summer camp is running')
})

app.listen(port, () => {
    console.log(`Summer camp is sitting on port ${port}`);
})