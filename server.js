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
    console.log('connected to database');
    const database = client.db("foodDelivery");
    const serviceCollection = database.collection("services");
    const cart_Collection = database.collection("cart");

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

    // load cart data according to user id get api
    app.get("/cart/:uid", async (req, res) => {
      const uid = req.params.uid;
      const query = { uid: uid };
      const result = await cart_Collection.find(query).toArray();
      res.json(result);
    });

    // add data to cart collection with additional info
    app.post("/services/add", async (req, res) => {
      const course = req.body;
      const result = await cart_Collection.insertOne(course);
      res.json(result);
    });

    // delete data from cart delete api
    app.delete("/delete/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await cart_Collection.deleteOne(query);
      res.json(result);
    });

    // purchase delete api
    app.delete("/purchase/:uid", async (req, res) => {
      const uid = req.params.uid;
      const query = { uid: uid };
      const result = await cart_Collection.deleteMany(query);
      res.json(result);
    });

    // orders get api
    app.get("/orders", async (req, res) => {
      const result = await cart_Collection.find({}).toArray();
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
