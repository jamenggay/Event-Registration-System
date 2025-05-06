import express from "express";
import {dirname} from "path";
import path from "path";
import {fileURLToPath} from "url";
import fs from "fs";
import multer from "multer";

//declaring app
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const port = 3000;

//middleware setup
app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "index.html"));
})

app.post("/events", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "events.html"))
})


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})