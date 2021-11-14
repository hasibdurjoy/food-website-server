const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT || 5000;
// http://localhost:5000
const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.8ngda.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


async function run() {
  try {
    await client.connect();
    const database = client.db("foodDelivery");
    const serviceCollection = database.collection("services");
    const orderCollection = database.collection("orders");

    // load courses get api
    app.get("/services", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = req.query.page;
      const cursor = serviceCollection.find({});
      const count = await cursor.count();
      let courses;

      if (size && page) {
        courses = await cursor
          .skip(size * page)
          .limit(size)
          .toArray();
      } else {
        courses = await cursor.toArray();
      }
      res.json({ count, courses });
    });

    // load single course get api
    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const course = await serviceCollection.findOne(query);
      res.json(course);
    });

    app.get("/services", async (req, res) => {
      const course = await serviceCollection.find({}).toArray();
      res.json(course);
    });

    //get all orders
    app.get("/orders", async (req, res) => {
      const course = await orderCollection.find({}).toArray();
      res.json(course);
    });

    // load cart data according to user id get api
    app.get("/myOrders", async (req, res) => {
      const uid = req.query.uid;
      console.log(uid);
      const query = { uid: uid };
      const result = await orderCollection.find(query).toArray();
      res.json(result);
    });



    // add data to cart collection with additional info
    app.post("/orders", async (req, res) => {
      const course = req.body;
      const result = await orderCollection.insertOne(course);
      res.json(result);
    });

    app.post('/services', async (req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service)
      res.json(result);
    });

    //UPDATE API
    app.put('/orders/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: "approved"
        },
      };
      const result = await orderCollection.updateOne(filter, updateDoc, options)
      console.log('updating', id)
      res.json(result)
    })

    // purchase delete api
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await orderCollection.deleteOne(query);
      res.json(result);
    });

  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
