import express from "express";
import { dirname } from "path";
import path from "path";
import { fileURLToPath } from "url";
import { pool, sql } from "./db-connection.js";
import fs from 'fs'
import cookieSession from 'cookie-session'
import { error } from "console";
//potek isahang import lang pala yung pool tsaka sql para magconnect kaines

//declaring app
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const port = 3000;

//middleware setup
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));
app.use(express.static(path.join(__dirname, "public")));

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
    const userID = req.session.user.id;
  
    if (!userID) {
        return res.status(401).json({ message: 'Unauthorized: No user session found.' });
    }
    
    const { base64FeatureImage, imageFileName, imageFileExtension, eventName, 
            startDateTime, endDateTime, location, description, category, 
            feedback, requireApproval, capacity, allowWaitlist, lastUpdated } = req.body

    // convert base64 string of featureImage into binary
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

    // checks for image duplication in uploads/featureImage folder
    for (let i = 1; i <= uploadsfeatureImagesFileName.length; i++) {
        if (uploadsfeatureImagesFileName.includes(featureImageFileName)) {
            featureImageFileName = `${imageFileName} (${i}).${imageFileExtension}`
        }
        else {
            break
        }
    }

    const featureImagePath = path.join(__dirname, 'public', 'uploads', 'featureImage', `${featureImageFileName}`);

    // saves featureImage in uploads/featureImage folder
    fs.writeFile(featureImagePath, binaryFeatureImage.data, (error) => { 
        if (error) { 
            console.log("Image Creation Failed: ", error) 
        }
    });

    const publicFeatureImagePath = `/uploads/featureImage/${featureImageFileName}`;

    try {
        await pool.request()
            .input('creatorID', sql.Int, userID)
            .input('featureImage', sql.VarChar, publicFeatureImagePath)
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

app.get("/user-profile", (req, res) => { 
    res.sendFile(path.join(__dirname, "public", "views", "user-profile.html"))  
})

app.get("/basic-profile", (req, res, next) => {
    // redirect to /user-profile if endpoint directly accessed in url browser
    if (req.headers['accept'] !== 'application/json') {
    return res.redirect('/basic-profile'); 
  }

  next();
})

app.get("/basic-profile", async (req, res) => {
    const userID = req.session.user.id;

    if (!userID) {
        return res.status(401).json({ message: 'Unauthorized: No user session found.' });
    }

    try {
        const result = await pool.request()
                        .input('userID', sql.Int, userID)
                        .query(`SELECT * 
                                FROM userTable 
                                WHERE userID = @userID`)

        if (!result?.recordset || result.recordset.length === 0) {
            console.log("User not found.")
            return res.status(404).json({ message : 'User not found.'})
        }

        const userData = { 
            fullname      : result.recordset[0].fullName,
            username      : result.recordset[0].username,
            email         : result.recordset[0].email,
            mobileNumber  : result.recordset[0].mobileNumber,
            profilePic    : result.recordset[0].profilePic,
            password      : result.recordset[0].password
        }

        console.log("User profile extraction success.")
        return res.status(200).json(userData)
    }
    catch (e) {
        console.log("User profile extraction failed: ", e)
        return res.status(500).json({ message: 'User profile extration failed', error : e})
    }
});

app.get("/user-events-created", async (req, res) => {
    const userID = req.session.user.id;

    if (!userID) {
        return res.status(401).json({ message: 'Unauthorized: No user session found.' });
    }

    try {
        const result = await pool.request()
                        .input('userID', sql.Int, userID)
                        .query(`SELECT * 
                                FROM eventsTable 
                                WHERE creatorID = @userID`)

        if (!result?.recordset || result.recordset.length === 0) {
            console.log("User not found.")
            return res.status(404).json({ message : 'User not found.'})
        }

        const eventsData = result.recordset.map(event => ({
                                                eventID         : event.eventID,
                                                eventName       : event.eventName,
                                                description     : event.description,
                                                location        : event.location,
                                                startDateTime   : event.startDateTime,
                                                endDateTime     : event.endDateTime, 
                                                featureImage    : event.featureImage,
                                                requireApproval : event.requireApproval,
                                                capacity        : event.capacity,
                                                feedbackLink    : event.feedbackLink,
                                                lastUpdated     : event.lastUpdated,
                                                category        : event.category,
                                                allowWaitlist   : event.allowWaitlist
                                            }))

        console.log("User events created extraction success.")
        return res.status(200).json(eventsData)
    }
    catch (e) {
        console.log("User events created extraction failed: ", e)
        return res.status(500).json({ message: 'User events created extration failed', error : e})
    }
});

app.patch("/user-pfp", async (req, res) => {
    const userID = req.session.user.id;

    if (!userID) {
        return res.status(401).json({ message: 'Unauthorized: No user session found.' });
    }

    const { base64ProfilePic, imageFileName, imageFileExtension } = req.body

    // convert base64 string of profilePic into binary
    function getBinaryValue(base64ProfilePic) {
        const matches = base64ProfilePic.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
        const response = {};

        if (!matches || matches.length !== 3) {
            console.log('Invalid input string');
            return null;
        }

        response.type = matches[1];
        response.data = Buffer.from(matches[2], 'base64');

        return response;
    }

    const binaryProfilePic = getBinaryValue(base64ProfilePic);

    if (!binaryProfilePic) {
        return res.json({ message: 'Invalid image format.' });
    }
    
    let uploadsProfilePicFileName = fs.readdirSync(path.join(__dirname, 'public', 'uploads', 'profilePic'))
    let profilePicFileName = `${imageFileName}.${imageFileExtension}`

    // checks for image duplication in uploads/profilePic folder
    for (let i = 1; i <= uploadsProfilePicFileName.length; i++) {
        if (uploadsProfilePicFileName.includes(profilePicFileName)) {
            profilePicFileName = `${imageFileName} (${i}).${imageFileExtension}`
        }
        else {
            break
        }
    }

    const profilePicPath = path.join(__dirname, 'public', 'uploads', 'profilePic', `${profilePicFileName}`);

    // saves profilePic in uploads/profilePic folder
    fs.writeFile(profilePicPath, binaryProfilePic.data, (error) => { 
        if (error) { 
            console.log("Image Creation Failed: ", error) 
        }
    });

    const publicProfilePicPath = `/uploads/profilePic/${profilePicFileName}`;

    try {
        await pool.request()
            .input('userID', sql.Int, userID)
            .input('profilePic', sql.VarChar, publicProfilePicPath)
            .query(`UPDATE userTable 
                    SET profilePic = @profilePic
                    WHERE userID = @userID`);
        
            console.log("User pfp update success.")
            return res.status(200).json({ message : "User pfp updated."})
    }
    catch (e) {
        console.log("User pfp update failed: ", e)
        return res.status(500).json({ message : "User pfp update failed.", error : e})
    }
});

app.patch("/user-info", async (req, res) => {
    const userID = req.session.user.id;

    if (!userID) {
        return res.status(401).json({ message: 'Unauthorized: No user session found.' });
    }

    const { fullname, username, email, mobile, bio } = req.body

    try {
        await pool.request()
            .input('userID', sql.Int, userID)
            .input('fullname', sql.VarChar, fullname)
            .input('username', sql.VarChar, username)
            .input('email', sql.VarChar, email)
            .input('mobileNum', sql.VarChar, mobile)
            .query(`UPDATE userTable 
                    SET 
                        fullName = @fullname, 
                        username = @username,
                        email = @email,
                        mobileNumber = @mobileNum
                    WHERE userID = @userID`);
        
            console.log("User information update success.")
            return res.status(200).json({ message : "User information updated."})
    }
    catch (e) {
        console.log("User information update failed: ", e)
        return res.status(500).json({ message : "User information update failed.", error : e})
    }
});

app.patch("/user-password", async (req, res) => {
    const userID = req.session.user.id;

    if (!userID) {
        return res.status(401).json({ message: 'Unauthorized: No user session found.' });
    }

    const { password } = req.body
    
    try {
        await pool.request()
            .input('userID', sql.Int, userID)
            .input('password', sql.VarChar, password)
            .query(`UPDATE userTable
                    SET password = @password
                    WHERE userID = @userID`)

        console.log("User password update success.")
        return res.status(200).json({ message : "User password updated."})
    }
    catch (e) {
        console.log("User password update failed: ", e)
        return res.status(500).json({ message : "User password update failed.", error : e})
    }
});

// for events management, pls don't delete
app.get("/event/:eventID", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "dummy-event.html"))  
});

// for events management, pls don't delete
app.get("/event-info/:eventID", async (req, res) => {
    const eventID = req.params.eventID

    try {
        const result = await pool.request()
            .input('eventID', sql.Int, eventID)
            .query(`SELECT * FROM eventsTable WHERE eventID = @eventID`)

        const eventData = {
            eventID         : result.recordset[0].eventID,
            eventName       : result.recordset[0].eventName,
            description     : result.recordset[0].description,
            location        : result.recordset[0].location,
            startDateTime   : result.recordset[0].startDateTime,
            endDateTime     : result.recordset[0].endDateTime, 
            featureImage    : result.recordset[0].featureImage,
            requireApproval : result.recordset[0].requireApproval,
            capacity        : result.recordset[0].capacity,
            feedbackLink    : result.recordset[0].feedbackLink,
            lastUpdated     : result.recordset[0].lastUpdated,
            category        : result.recordset[0].category,
            allowWaitlist   : result.recordset[0].allowWaitlist
        }

        console.log("Event details extraction successful")
        res.status(200).json(eventData)
    }
    catch (e) {
        console.log("Event details extraction failed: ", e)
        res.status(500).json({ message : 'Event details extraction failed', error : e})
    }
});

// for events management, pls don't delete
app.put("/edit-event", async (req, res) => {
    const { eventID, base64FeatureImage, imageFileName, imageFileExtension, eventName, 
            startDateTime, endDateTime, location, description, category, 
            feedback, requireApproval, capacity, allowWaitlist, lastUpdated } = req.body    
    try {
        const result = await pool.request()
            .input('eventID', sql.Int, eventID)
            .input('eventName', sql.VarChar, eventName)
            // .input('featureImage', sql.VarChar, publicFeatureImagePath)
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
            .query(`UPDATE eventsTable
                    SET 
                        eventName = @eventName,
                        startDateTime = @startDateTime,
                        endDateTime = @endDateTime,
                        location = @location,
                        description = @description,
                        category = @category,
                        feedbackLink = @feedbackLink,
                        requireApproval = @requireApproval,
                        capacity = @capacity,
                        allowWaitlist = @allowWaitlist,
                        lastUpdated = @lastUpdated
                    WHERE eventID = @eventID`)

        console.log("Event details update successful")
        res.status(200).json({ message : 'Event details updated' })
    }
    catch (e) {
        console.log("Event details update failed: ", e)
        res.status(500).json({ message : 'Event details update failed', error : e })
    }
});

// for events management, pls don't delete
app.get("/registrants/:eventID", async (req, res) => {
    const eventID = req.params.eventID

    try {
        const result = await pool.request()
            .input('eventID', sql.Int, eventID)
            .query(`SELECT rT.registrationID, uT.userID, uT.fullName, uT.username, uT.email, uT.mobileNumber, rT.status, rt.eventID 
                    FROM registrationTable rT
                    LEFT JOIN userTable uT ON rt.userID = uT.userID
                    WHERE rT.eventID = @eventID`)

        const registrationData = result.recordset.map(registrant => ({
                                                registrationID : registrant.registrationID,
                                                userID : registrant.userID,
                                                fullname : registrant.fullName,
                                                username : registrant.username,
                                                email : registrant.email,
                                                mobileNumber : registrant.mobileNumber,
                                                status : registrant.status,
                                                eventID : registrant.eventID
                                            }))

        console.log("Registration details extraction successful")
        res.status(200).json(registrationData)
    }
    catch (e) {
        console.log("Registration details extraction failed: ", e)
        res.status(500).json({ message : 'Registration details extraction failed', error : e})
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
