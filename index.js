require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const dns = require("dns");
const urlParser = require("url");
// Mongoose
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const urlSchema = new mongoose.Schema({
    original_url: String,
    short_url: Number,
});
var Url = mongoose.model("Url", urlSchema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
    res.sendFile(process.cwd() + "/views/index.html");
});

app.get("/api/shorturl/:short_url", (req, res) => {
    Url.find({
        short_url: req.params.short_url,
    })
        .then((doc) => {
            res.redirect(doc[0].original_url);
        })
        .catch((err) => {
            console.error(err);
        });
});

app.post("/api/shorturl", async (req, res) => {
    const original_url = req.body.url;
    const url = urlParser.parse(original_url);
    dns.lookup(url.hostname, async (err) => {
        if (err) {
            res.json({ error: "invalid url" });
        } else {
            const count = await Url.countDocuments();
            const newUrl = new Url({
                original_url: original_url,
                short_url: count,
            });
            newUrl
                .save()
                .then((doc) => {
                    res.json({
                        original_url: doc.original_url,
                        short_url: doc.short_url,
                    });
                })
                .catch((err) => {
                    console.error(err);
                });
        }
    });
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
