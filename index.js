require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bodyParser = require("body-parser");
const validUrl = require("valid-url");
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

// Your first API endpoint
app.get("/api/hello", function (req, res) {
    res.json({ greeting: "hello API" });
});

app.get("/api/shorturl/:short_url",  (req, res) => {
     Url.find({
        short_url: req.params.short_url,
    })
        .then((doc) => {
            res.redirect(doc[0].original_url)
        })
        .catch((err) => {
            console.error(err);
        })
});

app.post("/api/shorturl", async (req, res) => {
    const count = await Url.find({}).countDocuments();
    if (validUrl.isUri(req.body.url)) {
        let url = new Url({
            original_url: req.body.url,
            short_url: count,
        });
        url.save()
            .then((doc) => {
                res.json({
                    original_url: doc.original_url,
                    short_url: doc.short_url,
                });
            })
            .catch((err) => {
                console.error(err);
            });
    } else {
        res.json({
            error: "invalid url",
        });
    }
});

app.listen(port, function () {
    console.log(`Listening on port ${port}`);
});
