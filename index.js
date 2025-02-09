const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xox9a.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

        const movieCollection = client.db('movieDB').collection('movie');
        const favoriteMovieCollection = client.db('movieDB').collection('favorite')
        const userCollection = client.db('movieDB').collection('user')


        app.get('/movie', async (req, res) => {
            const { searchParams } = req.query;
            console.log(searchParams);

            let option = {}
            if (searchParams) {
                option = { title: { $regex: searchParams, $options: "i" } }
            }
            const cursor = movieCollection.find(option);
            const result = await cursor.toArray();
            res.send(result)
        })
        app.get('/movie/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await movieCollection.findOne(query)
            res.send(result)
        })

        app.get('/topRated', async (req, res) => {
            const cursor = movieCollection.find().sort({ rating: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result)

        })

        app.post('/movie', async (req, res) => {
            const newAddMovie = req.body;
            console.log(newAddMovie);
            const result = await movieCollection.insertOne(newAddMovie)
            res.send(result)
        })

        app.put('/movie/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updatedMovies = req.body;
            const movie = {
                $set: {
                    title: updatedMovies.title,
                    genre: updatedMovies.genre,
                    duration: updatedMovies.duration,
                    releaseYear: updatedMovies.releaseYear,
                    poster: updatedMovies.poster,
                    summary: updatedMovies.summary,
                    rating: updatedMovies.rating,
                }
            }
            const result = await movieCollection.updateOne(filter, movie, options)
            res.send(result)
        })

        app.delete('/movie/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await movieCollection.deleteOne(query);
            res.send(result)
        })



        // favorite
        app.get("/favorite/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const result = await favoriteMovieCollection.find(query).toArray();
            res.send(result);
        });

        app.post('/favorite', async (req, res) => {
            const favorite = req.body;
            console.log(favorite);
            const result = await favoriteMovieCollection.insertOne(favorite)
            res.send(result)
        })

        app.delete('/favorite/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await favoriteMovieCollection.deleteOne(query);
            res.send(result)
        })



        //users
        app.get('/users', async (req, res) => {
            const cursor = userCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.post('/users', async (req, res) => {
            const newUser = req.body;
            console.log('crate user', newUser);
            const result = await userCollection.insertOne(newUser);
            res.send(result)
        })

        app.patch('/users', async (req, res) => {
            const email = req.body.email;
            const filter = { email };
            const updatedDoc = {
                $set: {
                    lastSignInTime: req.body?.lastSignInTime

                }
            }

            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result)
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




app.get('/', (req, res) => {
    res.send('Movie server is running');
})

app.listen(port, () => {
    console.log(`Movie server is running on port:${port}`);

})