import express from "express";
import fetch from "node-fetch";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.urlencoded({extended: true}));

app.set("view engine", "ejs");

app.use(express.static("public"));

const uri = process.env.DB_URL;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
    // Your code here
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error.message);
  });

const cryptoSchema = new mongoose.Schema({
    name: String,
    last: Number, 
    buy: Number, 
    Sell: Number, 
    volume: Number, 
    base_unit: String
});

const Crypto = mongoose.model("Crypto", cryptoSchema);

app.get("/", async (req, res) => {

    fetch("https://api.wazirx.com/api/v2/tickers")
        .then(response => response.json())
        .then((data) => {
            const arr = Object.keys(data);
            arr.forEach((key) => {
                const crypto = new Crypto({
                    name: data[key].name,
                    last: data[key].last, 
                    buy: data[key].buy, 
                    Sell: data[key].sell, 
                    volume: data[key].volume, 
                    base_unit: data[key].base_unit
                });
                crypto.save((err) => {
                    if(err) {
                        console.log(err);
                    } else {
                        Crypto.find({}).limit(10).exec((err, foundCrypto) => {
                            if(err) {
                                console.log(err);
                            } else {
                                res.render("index", {foundCrypto: foundCrypto});
                            }
                        });
                    }
                });
            });
        })
        .catch(err => console.log(err.message));
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});