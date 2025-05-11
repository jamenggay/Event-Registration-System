import express from "express";
import { dirname } from "path";
import path from "path";
import { fileURLToPath } from "url";
import { pool, sql } from "./db-connection.js";
import multer from 'multer'
import bodyParser from 'body-parser'
import fs from 'fs'
import cookieSession from 'cookie-session'
//potek isahang import lang pala yung pool tsaka sql para magconnect kaines

//declaring app
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const port = 3000;

//middleware setup
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(express.static(path.join(__dirname, "public")));
const upload = multer({ dest : path.join(__dirname, 'public', 'uploads', 'featureImage') })
app.use(cookieSession({
  name: 'session',
  keys: ['cooKey'], 
}));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "index.html"));
});

app.post("/register", async (req, res) => {
    const { email, mobileNum, fullName, userName, password } = req.body;

    try {
        await pool.request()
            .input('email', sql.VarChar, email)
            .input('mobileNum', sql.VarChar, mobileNum)
            .input('fullName', sql.VarChar, fullName)
            .input('userName', sql.VarChar, userName)
            .input('password', sql.VarChar, password)
            .query('INSERT INTO userTable (email, mobileNumber, fullName, username, password) VALUES (@email, @mobileNum, @fullName, @userName, @password)');

        res.json({ success: true, message: 'Registration successful!' });

    }
    catch (err) {
        console.error("Error during registration:", err);
        res.status(500).json({ message: 'Registration Failed' });
    }
});

app.post("/login", async (req, res) => {
    const { userName, password } = req.body;

    try {
        const result = await pool.request()
            .input('userName', sql.VarChar, userName)
            .query('SELECT * FROM userTABLE WHERE username = @userName')

        const user = result.recordset[0]; //stores the result to user variable
        
        //login validation

        if (!user) {
            return res.json({ success: false, message: "Incorrect username or password!" });
        }

        if (user.password !== password) {
            return res.json({ success: false, message: "Incorrect username or password!" });
        }

        // cookie store logged-in user credentials
        req.session.user = {
            id: user.userID,
            username: user.username
        };
        return res.json({ success: true, message: "Login success!" });

    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' })
    }
});

app.get("/create-events", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "create-events.html"))
});

app.post("/create-events", async (req, res) => {   
    if (!req.session.user) {
        return res.status(401).json({ message: 'Unauthorized'});
    }
    
    const creatorID = req.session.user.id;

    const { base64FeatureImage, imageFileName, imageFileExtension, eventName, 
            startDateTime, endDateTime, location, description, category, 
            feedback, requireApproval, capacity, allowWaitlist, lastUpdated} = req.body

    function getBinaryValue(base64FeatureImage) {
        const matches = base64FeatureImage.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
        const response = {};

        if (matches.length !== 3) {
            console.log('Invalid input string');
        }

        response.type = matches[1];
        response.data = Buffer.from(matches[2], 'base64');

        return response;
    }

    const binaryFeatureImage = getBinaryValue(base64FeatureImage);

    if (!binaryFeatureImage) {
        return res.json({ message: 'Invalid image format.' });
    }
    
    let uploadsfeatureImagesFileName = fs.readdirSync(path.join(__dirname, 'public', 'uploads', 'featureImage'))
    let featureImageFileName = `${imageFileName}.${imageFileExtension}`

    for (let i = 1; i <= uploadsfeatureImagesFileName.length; i++) {
        if (uploadsfeatureImagesFileName.includes(featureImageFileName)) {
            featureImageFileName = `${imageFileName} (${i}).${imageFileExtension}`
        }
        else {
            break
        }
    }
    console.log(featureImageFileName)

    const featureImagePath = path.join(__dirname, 'public', 'uploads', 'featureImage', `${featureImageFileName}`);

    fs.writeFile(featureImagePath, binaryFeatureImage.data, (error) => { 
        if (error) { 
            console.log("Image Creation Failed: ", error) 
        }
    });

    try {
        await pool.request()
            .input('creatorID', sql.Int, creatorID)
            .input('featureImage', sql.VarChar, featureImagePath)
            .input('eventName', sql.VarChar, eventName)
            .input('startDateTime', sql.DateTime, startDateTime)
            .input('endDateTime', sql.DateTime, endDateTime) 
            .input('location', sql.VarChar, location)
            .input('description', sql.VarChar, description)
            .input('category', sql.VarChar, category)
            .input('feedbackLink', sql.VarChar, feedback)
            .input('requireApproval', sql.VarChar, requireApproval)
            .input('capacity', sql.Int, capacity)
            .input('allowWaitlist', sql.VarChar, allowWaitlist)
            .input('lastUpdated', sql.DateTime, lastUpdated)
            .query(`INSERT INTO eventsTable (eventName, description, category, location, startDateTime, 
                                endDateTime, featureImage, requireApproval, capacity, feedbackLink, 
                                allowWaitlist, lastUpdated, creatorID) 
                    SELECT @eventName, @description, @category, @location, @startDateTime, 
                            @endDateTime, @featureImage, @requireApproval, @capacity, @feedbackLink,
                            @allowWaitlist, @lastUpdated, u.userID
                    FROM userTable u
                    WHERE userID = @creatorID`)

        console.log('Event creation successful')
        return res.status(201).json({ message: "Event creation successful" })
    }
    catch (e) {
        console.log("Event Creation Failed: ", e)
        return res.status(500).json({ message: "Event creation failed", error: e })
    }
});

app.get("/events", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "events.html"))
});

app.get("/discover", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "discover.html"))
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
