import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"

const app = express()
app.use(express.json())
app.use(express.urlencoded())
app.use(cors())

dotenv.config()
//DB Connect
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useunifiedTopology: true
}, () => {
    console.log("DB Connected")
})

//Contact Form
const ItemSchema = new mongoose.Schema({
    id: Number,
    name: String,
    price: Number,
    image: String,
    category: String,
})

const item = new mongoose.model("item", ItemSchema)

//Routes

//CONTACT
app.post("/item", (req, res) => {
    const { id, name, price, image, category } = req.body
    const user = new item({
        id, 
        name, 
        price, 
        image, 
        category
    })

    user.save(err => {
        if (err) {
            res.send(err)
        }
        else {
            res.send({ message: "Succesfully Added" })
        }
    })
})

app.get("/item", (req, res) => {
    item.find()
    .then((result) => {
        res.send(result)
    })
    .catch((err) => {
        res.send(err)
    })
})

//Search Queries
app.post("/search", async (req, res) => {
    const { name } = req.body
    
    const query = await item.aggregate([
        {
            "$search": {
                "autocomplete": {
                    "query": name,
                    "path": "name",
                    "fuzzy": {
                        "maxEdits": 1
                    }
                 }
            }
        }
    ]).exec();

    const result = query
    res.send(result)
})

//Server Hosting
app.listen(5000, () => {
    console.log("BackEnd started at port 5000")
})