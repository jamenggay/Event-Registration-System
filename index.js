import express from "express";
import { dirname } from "path";
import path from "path";
import { fileURLToPath } from "url";
import { pool, sql } from "./db-connection.js";
import multer from 'multer';
import bodyParser from 'body-parser';
import fs from 'fs';
import cookieSession from 'cookie-session';
import bcrypt from "bcrypt";
import { error } from "console";
import { WebSocketServer } from 'ws';
import http from 'http';
import converter from "json-2-csv";
import { sourceMapsEnabled } from "process";

//potek isahang import lang pala yung pool tsaka sql para magconnect kaines

//declaring app
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const port = 3000;

//middleware setup
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, "public")));
const upload = multer({ dest: path.join(__dirname, 'public', 'uploads', 'featureImage') })
app.use(cookieSession({
    name: 'session',
    keys: ['cooKey'],
}));

app.use(cookieSession({
    name: 'session',
    keys: ['cooKey'],
}));

app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});


// set http server for http requests (few GET, POST, PUT, PATCH, DELETE)
const server = http.createServer(app)

// set websocket server
const wss = new WebSocketServer({ server })

// home page
app.get("/", (req, res) => {

    req.session = null; 
    
    res.sendFile(path.join(__dirname, "public", "views", "index.html"));
});

// home page
app.post("/register", async (req, res) => {

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    const { email, mobileNum, fullName, userName } = req.body;
    console.log("Hash Pass: ", hashedPassword);

    try {
        await pool.request()
            .input('email', sql.VarChar, email)
            .input('mobileNum', sql.VarChar, mobileNum)
            .input('fullName', sql.VarChar, fullName)
            .input('userName', sql.VarChar, userName)
            .input('hashedPassword', sql.VarChar, hashedPassword)
            .query('INSERT INTO userTable (email, mobileNumber, fullName, username, password) VALUES (@email, @mobileNum, @fullName, @userName, @hashedPassword)');

        res.json({ success: true, message: 'Account registered.' });

    }
    catch (err) {
        console.error("Error during registration:", err);
        res.status(500).json({ message: 'Registration Failed.' });
    }
});

// home page
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

        const comparePassword = await bcrypt.compare(password, user.password);

        if (!comparePassword) {
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

// home page
app.get('/logout', (req, res)=>{

    res.redirect('/');
});

// create events page
app.get("/create-events", (req, res) => {
    if (!req.session.user) {
        return res.redirect('/'); //require log in
    }

    res.sendFile(path.join(__dirname, "public", "views", "create-events.html"))
});

// create events page
app.post("/create-events", async (req, res) => { 
    const userID = req.session.user.id;
    
    const { base64FeatureImage, imageFileName, imageFileExtension, eventName, 
            startDateTime, endDateTime, location, description, category, 
            feedback, requireApproval, capacity, allowWaitlist, lastUpdated, themeIndex } = req.body

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
            .input('eventName', sql.NVarChar, eventName)
            .input('startDateTime', sql.DateTime, startDateTime)
            .input('endDateTime', sql.DateTime, endDateTime) 
            .input('location', sql.VarChar, location)
            .input('description', sql.NVarChar, description)
            .input('category', sql.VarChar, category)
            .input('feedbackLink', sql.VarChar, feedback)
            .input('requireApproval', sql.VarChar, requireApproval)
            .input('capacity', sql.Int, capacity)
            .input('allowWaitlist', sql.VarChar, allowWaitlist)
            .input('lastUpdated', sql.DateTime, lastUpdated)
            .input('themeIndex', sql.Int, themeIndex)
            .query(`INSERT INTO eventsTable (eventName, description, category, location, startDateTime, 
                                endDateTime, featureImage, requireApproval, capacity, feedbackLink, 
                                allowWaitlist, lastUpdated, themeIndex, creatorID) 
                    SELECT @eventName, @description, @category, @location, @startDateTime, 
                            @endDateTime, @featureImage, @requireApproval, @capacity, @feedbackLink,
                            @allowWaitlist, @lastUpdated, @themeIndex, u.userID
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

//fetch event details from eventsTable
app.get("/event-details", async (req, res) => {
    const userID = req.session.user.id;

    try {
        let eventsResult = await pool.request().query(`SELECT * FROM eventsTable
            WHERE endDateTime > GETDATE();`);


        let createdEventsResult= await pool.request()
        .input('userID', sql.Int, userID)
        .query(`SELECT * FROM eventsTable WHERE creatorID = @userID`);

        res.json({ 
            events: eventsResult.recordset,
            createdEvents : createdEventsResult.recordset
        });
    }
    catch (err) {
        console.error("Error fetching data", err);
    }
});

//api for fromating datetime
app.get("/api/formatStartDate", async (req, res) => {
    try {
        let result = await pool.request().query(`SELECT FORMAT(startDateTime, 'MMMM d, h:mm tt') 
            AS formattedDate FROM eventsTable;`);
        res.json(result.recordset);
        console.log("start date and time converted successfully!")
    }
    catch (err) {
        console.error("Error formatting start Date and Time", err);
    }
});
//api for fromating datetime
app.get("/api/formatEndDate", async (req, res) => {
    try {
        let result = await pool.request().query(`SELECT FORMAT(endDateTime, 'MMMM d, h:mm tt') 
            AS formattedDate FROM eventsTable;`);
        res.json(result.recordset);
        console.log("start date and time converted successfully!")
    }
    catch (err) {
        console.error("Error formatting end Date and Time", err);
    }
});
//get event end time only
app.get("/api/endTime", async (req, res) => {
    try {
        let result = await pool.request().query(`SELECT FORMAT(endDateTime, 'h:mm tt') 
            AS endTime FROM eventsTable;`);
        res.json(result.recordset);
        console.log("start date and time converted successfully!")
    }
    catch (err) {
        console.error("Error formatting end Date and Time", err);
    }
});
//returns boolean value when comparing the start date and end date
app.get("/api/compareDate", async (req, res) => {
    try {
        let result = await pool.request().query(`SELECT eventID, 
        IIF(CAST(startDateTime AS DATE) = CAST(endDateTime AS DATE), 'True', 'False') 
        AS SameDay FROM eventsTable;`);
        res.json(result.recordset);
    }
    catch (err) {

    }
})

// events page
app.get("/events", (req, res) => {
    if (!req.session.user) {
    return res.redirect('/'); //require log in
  }
    res.sendFile(path.join(__dirname, "public", "views", "events.html"))

});

// discover page
app.get("/discover", (req, res) => {
    if (!req.session.user) {
    return res.redirect('/'); //require log in
  }

    res.sendFile(path.join(__dirname, "public", "views", "discover.html"))

});

// register button
app.post("/register-event", async (req, res) => {
    const userID = req.session.user.id;
    const { eventID, requireApproval} = req.body
    
    if(requireApproval == 'Yes') {
        try {
            const result1 = await pool.request()
                .input('eventID', sql.Int, eventID)
                .query(`SELECT COUNT(*) registrationCount 
                    FROM registrationTable 
                    WHERE status != 'Declined' AND eventID = @eventID`);

            const numOfRegistration = result1.recordset[0].registrationCount;

            const result2 = await pool.request()
                    .input('eventID', sql.Int, eventID)
                    .query(`SELECT capacity FROM eventsTable
                            WHERE eventID = @eventID;`)
            const eventCapacity = result2.recordset[0].capacity;

            const result3 = await pool.request()
                    .input('eventID', sql.Int, eventID)
                    .query(`SELECT allowWaitlist FROM eventsTable
                        WHERE eventID = @eventID`)
            const allowWaitlist = result3.recordset[0].allowWaitlist;
            
            console.log("number of registration: ", numOfRegistration);
            console.log("capacity: ", eventCapacity);
            console.log("allow waitlist: ", allowWaitlist);

            if(numOfRegistration >= eventCapacity && allowWaitlist == 'No'){
            return res.status(400).json({ success: false, message: 'Maximum capacity has been reached. Registration closed.' });
            }
            else if(numOfRegistration >= eventCapacity && allowWaitlist == 'Yes'){
                const status = 'Waitlisted';
                await pool.request()
                .input('eventID', sql.Int, eventID)
                .input('userID', sql.Int, userID)
                .input('status', sql.VarChar, status)
                .query('INSERT INTO registrationTable (eventID, userID, status) VALUES (@eventID, @userID, @status)');
            
                
                res.json({success: true, message: 'Maximum capacity reached.', status: "Waitlisted" });
            }
            else{
                const status = 'Pending';
                await pool.request()
                .input('eventID', sql.Int, eventID)
                .input('userID', sql.Int, userID)
                .input('status', sql.VarChar, status)
                .query('INSERT INTO registrationTable (eventID, userID, status) VALUES (@eventID, @userID, @status)');
                
                res.json({success: true, message: 'You have registered into an event', status: "Registered" });
            } 
        }
        catch(err) {
            console.error("Error registring event: ", err);
            res.status(500).json({message: 'Registration Failed'}); 
        }
    }
    else {
        try {
            const result1 = await pool.request()
                .input('eventID', sql.Int, eventID)
                .query(`SELECT COUNT(*) registrationCount 
                    FROM registrationTable 
                    WHERE status != 'Declined' AND eventID = @eventID`);

            const numOfRegistration = result1.recordset[0].registrationCount;

            const result2 = await pool.request()
                    .input('eventID', sql.Int, eventID)
                    .query(`SELECT capacity FROM eventsTable
                            WHERE eventID = @eventID;`)
            const eventCapacity = result2.recordset[0].capacity;

            const result3 = await pool.request()
                    .input('eventID', sql.Int, eventID)
                    .query(`SELECT allowWaitlist FROM eventsTable
                        WHERE eventID = @eventID`)
            const allowWaitlist = result3.recordset[0].allowWaitlist;
            
            console.log("number of registration: ", numOfRegistration);
            console.log("capacity: ", eventCapacity);
            console.log("allow waitlist: ", allowWaitlist);

            if(numOfRegistration >= eventCapacity && allowWaitlist == 'No'){
                return res.status(400).json({ success: false, message: 'Maximum capacity has been reached. Registration closed.' });
            }
            else if(numOfRegistration >= eventCapacity && allowWaitlist == 'Yes'){
                const status = 'Waitlisted';
                await pool.request()
                .input('eventID', sql.Int, eventID)
                .input('userID', sql.Int, userID)
                .input('status', sql.VarChar, status)
                .query('INSERT INTO registrationTable (eventID, userID, status) VALUES (@eventID, @userID, @status)');
            
                
                res.json({success: true, message: 'Maximum capacity reached. You are waitlisted.', status: "Waitlisted" });
            }
            else{
                const status = 'Approved';
            await pool.request()
                .input('eventID', sql.Int, eventID)
                .input('userID', sql.Int, userID)
                .input('status', sql.VarChar, status)
                .query('INSERT INTO registrationTable (eventID, userID, status) VALUES (@eventID, @userID, @status)');
            
            res.json({success: true, message: 'User successfully registered into an event', status: "Rgistered" });

            }
            
        }
        catch(err){
            console.error("Error registring event: ", err);
            res.status(500).json({message: 'Registration Failed'}); 
        }    
    }
});
app.get("/api/user-registrations", async (req, res) => {
    const userID = req.session.user.id;

    try {
        const result = await pool.request()
            .input('userID', sql.Int, userID)
            .query('SELECT eventID, status  FROM registrationTable WHERE userID = @userID');

      res.json({ registrations: result.recordset });
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ message: 'Server error' });
  }

});

// cancelation of registration
app.delete("/cancel-registration", async (req, res) => {
    const userID = req.session.user.id;
    const { eventID } = req.body

    try {
        await pool.request()
            .input('eventID', sql.Int, eventID)
            .input('userID', sql.Int, userID)
            .query(`DELETE FROM registrationTable WHERE eventID = @eventID AND userID = @userID`)

        console.log("Event registration cancelation success")
        res.status(200).json({ success: true, message : 'Event registration cancelled.' })
    }
    catch (e) {
        console.log("Event registration cancelation failed")
        res.status(500).json({success: false, message : 'Event registration cancelation failed', error : e })
    }
});

// user profile page
app.get("/user-profile", (req, res) => { 
    if (!req.session.user) {
    return res.redirect('/'); //require log in
  }
    res.sendFile(path.join(__dirname, "public", "views", "user-profile.html"))
})

// user profile page
app.get("/basic-profile", (req, res, next) => {
    // redirect to /user-profile if endpoint directly accessed in url browser
    if (req.headers['accept'] !== 'application/json') {
        return res.redirect('/basic-profile');
    }

    next();
})

// user profile page
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
            return res.status(404).json({ message: 'User not found.' })
        }

        const userData = {
            fullname: result.recordset[0].fullName,
            username: result.recordset[0].username,
            email: result.recordset[0].email,
            mobileNumber: result.recordset[0].mobileNumber,
            profilePic: result.recordset[0].profilePic,
            bio: result.recordset[0].bio,
        }

        console.log("User profile extraction success.")
        return res.status(200).json(userData)
    }
    catch (e) {
        console.log("User profile extraction failed: ", e)
        return res.status(500).json({ message: 'User profile extration failed', error: e })
    }
});

// user profile page
app.get("/user-events-created", async (req, res) => {
    const userID = req.session.user.id;

    if (!userID) {
        return res.status(401).json({ message: 'Unauthorized: No user session found.' });
    }

    try {
        const result = await pool.request()
                        .input('userID', sql.Int, userID)
                        .query(`SELECT 
                                    eT.eventID, eT.eventName, eT.description, eT.location, eT.startDateTime, eT.endDateTime,
                                    eT.featureImage, eT.requireApproval, eT.capacity, eT.feedbackLink, eT.lastUpdated,
                                    eT.category, eT.allowWaitlist, eT.themeIndex, AVG(fT.rating) AS ratings,
                                    IIF(CAST(eT.startDateTime AS DATE) = CAST(eT.endDateTime AS DATE), 'True', 'False') AS sameDay,
                                    IIF(MONTH(eT.startDateTime) = MONTH(eT.endDateTime) AND YEAR(eT.startDateTime) = YEAR(eT.endDateTime), 'True', 'False') AS sameMonth,
                                    IIF(YEAR(eT.startDateTime) = YEAR(eT.endDateTime), 'True', 'False') AS sameYear 
                                FROM eventsTable eT
                                LEFT JOIN feedbackTable fT ON eT.eventID = fT.eventID
                                WHERE eT.creatorID = @userID
                                GROUP BY 
                                    eT.eventID, eT.eventName, eT.description, eT.location, eT.startDateTime, eT.endDateTime,
                                    eT.featureImage, eT.requireApproval, eT.capacity, eT.feedbackLink, eT.lastUpdated,
                                    eT.category, eT.allowWaitlist, eT.themeIndex`)

        const eventsData = result.recordset.map(event => ({
                                                eventID         : event.eventID,
                                                eventName       : event.eventName,
                                                description     : event.description,
                                                location        : event.location,
                                                startDateTime   : event.startDateTime,
                                                endDateTime     : event.endDateTime, 
                                                sameDay         : event.sameDay,
                                                sameMonth       : event.sameMonth,
                                                sameYear        : event.sameYear,
                                                featureImage    : event.featureImage,
                                                requireApproval : event.requireApproval,
                                                capacity        : event.capacity,
                                                feedbackLink    : event.feedbackLink,
                                                lastUpdated     : event.lastUpdated,
                                                category        : event.category,
                                                allowWaitlist   : event.allowWaitlist,
                                                themeIndex      : event.themeIndex,
                                                ratings         : event.ratings
                                            }))

        console.log("User events created extraction success.")
        return res.status(200).json(eventsData)
    }
    catch (e) {
        console.log("User events created extraction failed: ", e)
        return res.status(500).json({ message: 'User events created extration failed', error: e })
    }
});

// user profile page
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
        return res.status(200).json({ message: "User pfp updated." })
    }
    catch (e) {
        console.log("User pfp update failed: ", e)
        return res.status(500).json({ message: "User pfp update failed.", error: e })
    }
});

// user profile page
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
            .input('bio', sql.NVarChar, bio)
            .query(`UPDATE userTable 
                    SET 
                        fullName = @fullname, 
                        username = @username,
                        email = @email,
                        mobileNumber = @mobileNum,
                        bio = @bio
                    WHERE userID = @userID`);

        console.log("User information update success.")
        return res.status(200).json({ message: "User information updated." })
    }
    catch (e) {
        console.log("User information update failed: ", e)
        return res.status(500).json({ message: "User information update failed.", error: e })
    }
});

// user profile page
app.patch("/user-password", async (req, res) => {
    const userID = req.session.user.id;

    if (!userID) {
        return res.status(401).json({ message: 'Unauthorized: No user session found.' });
    }

    const { currentPassword, newPassword } = req.body

    try {
        const result = await pool.request()
            .input('userID', sql.Int, userID)
            .query(`SELECT password
                    FROM userTable
                    WHERE userID = @userID`)

        const storedPassword = result.recordset[0].password

        const isMatch = await bcrypt.compare(currentPassword, storedPassword)

        if (isMatch) {
            if (currentPassword === newPassword) {
                return res.status(400).json({ message: "New password must be different from the current password." });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            try {
                await pool.request()
                    .input('userID', sql.Int, userID)
                    .input('hashedPassword', sql.VarChar, hashedPassword)
                    .query(`UPDATE userTable
                            SET password = @hashedPassword
                            WHERE userID = @userID`)

                console.log("User password update success.")
                return res.status(200).json({ message: "User password updated." })
            }
            catch (e) {
                console.log("User password update failed: ", e)
                return res.status(500).json({ message: "User password update failed.", error: e })
            }
        }
        else {
            return res.status(401).json({ message: "Incorrect current password." })
        }
    }
    catch (e) {
        console.log("User password extraction failed: ", e)
    }
});

// event management page
app.get("/event/:eventID", async (req, res) => {
    if (!req.session.user) {
        return res.redirect('/'); //require log in
    }

    const eventID = req.params.eventID
    const userID = req.session.user.id

    try {
        const result = await pool.request()
                        .input('eventID', sql.Int, eventID)
                        .input('userID', sql.Int, userID)
                        .query(`SELECT * FROM eventsTable WHERE eventID = @eventID AND creatorID = @userID`)

        if (result.recordset.length == 0) { 
            res.redirect('/events')
        }
        else if (result.recordset.length != 0) {
            res.sendFile(path.join(__dirname, "public", "views", "events-management.html"))  
        }
    }
    catch (e) {

    }
});

//event management page 
wss.on('connection', async (ws, req) => {
    console.log('Client WebSocket Connected');
    
    const eventID = req.url.split('/').pop()

    ws.on('message', async (message) => {
        const requestedData = JSON.parse(message)

        // GET event details for selected event
        if (requestedData.type == 'getEventData') {
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
                ws.send(JSON.stringify({ status : 200, type : 'eventData', eventData : eventData}))
            }
            catch (e) {
                console.log("Event details extraction failed: ", e)
                ws.send(JSON.stringify({ status: 500, message : 'Event details extraction failed', error : e}))
            }
        }
        // GET registration details
        else if (requestedData.type == 'getRegistrationData') {
            try {
                const result = await pool.request()
                    .input('eventID', sql.Int, eventID)
                    .query(`SELECT rT.registrationID, uT.userID, uT.fullName, uT.profilePic, rT.status, rt.eventID 
                            FROM registrationTable rT
                            LEFT JOIN userTable uT ON rt.userID = uT.userID
                            WHERE rT.eventID = @eventID`)

                const registrationData = result.recordset.map(registrant => ({
                                                        registrationID : registrant.registrationID,
                                                        userID : registrant.userID,
                                                        fullname : registrant.fullName,
                                                        profilePic : registrant.profilePic,
                                                        status : registrant.status,
                                                        eventID : registrant.eventID
                                                    }))

                console.log("Registration details extraction successful")
                ws.send(JSON.stringify({ status : 200, type : 'registrationData', registrationData : registrationData }))
            }
            catch (e) {
                console.log("Registration details extraction failed: ", e)
                ws.send(JSON.stringify({ status: 500, message : 'Registration details extraction failed', error : e}))
            }
        }
        // GET approved guest details
        else if (requestedData.type == 'getApprovedGuestsData') {
            try {
                const result = await pool.request()
                    .input('eventID', sql.Int, eventID)
                    .query(`SELECT rT.registrationID, uT.userID, uT.fullName, uT.profilePic, rT.status, rT.eventID 
                            FROM registrationTable rT
                            LEFT JOIN userTable uT ON rT.userID = uT.userID
                            WHERE rT.eventID = @eventID AND rT.status = 'Approved'
                            ORDER BY rT.approvedAt ASC`)
                
                const approvedGuestsData = result.recordset.map(guest => ({
                                                                registrationID : guest.registrationID,
                                                                userID : guest.userID,
                                                                fullname : guest.fullName,
                                                                profilePic : guest.profilePic,
                                                                status : guest.status,
                                                                eventID : guest.eventID
                                                            }))

                console.log("Approved guests extraction successful")
                ws.send(JSON.stringify({ status : 200, type : 'approvedGuestsData', approvedGuestsData : approvedGuestsData }))
            }
            catch (e) {
                console.log("Approved registrants extraction failed: ", e)
                ws.send(JSON.stringify({ status: 500, message : 'Approved guests extraction failed', error : e}))
            }
        }
        // GET attended guest details
        else if (requestedData.type == 'getAttendeesData') {
            try {
                const result = await pool.request()
                    .input('eventID', sql.Int, eventID)
                    .query(`SELECT aT.attendanceID, aT.eventID, uT.userID, uT.fullName, aT.checkedInAt
                            FROM attendeeTable aT
                            JOIN userTable uT ON aT.userID = uT.userID
                            WHERE aT.eventID = @eventID
                            ORDER BY aT.attendanceID ASC`)
                
                const attendeesData = result.recordset.map(attendee => ({
                                                                attendanceID : attendee.attendanceID,
                                                                eventID : attendee.eventID,
                                                                userID : attendee.userID,
                                                                fullname : attendee.fullName,
                                                                checkedInAt : attendee.checkedInAt
                                                            }))

                console.log("Attendees extraction successful")
                ws.send(JSON.stringify({ status : 200, type : 'attendeesData', attendeesData : attendeesData }))
            }
            catch (e) {
                console.log("Attendees extraction failed: ", e)
                ws.send(JSON.stringify({ status: 500, message : 'Attendees extraction failed', error : e}))
            }
        }
    })
});

// event management page
app.put("/event/:eventID", async (req, res) => {
    const eventID = req.params.eventID

    const { base64FeatureImage, imageFileName, imageFileExtension, dbImagePath,
            eventName, startDateTime, endDateTime, location, description, category, 
            feedbackLink, requireApproval, capacity, allowWaitlist, lastUpdated } = req.body  

    let publicFeatureImagePath = null

    if (!base64FeatureImage) {
        publicFeatureImagePath = dbImagePath
    }
    else {
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

        publicFeatureImagePath = `/uploads/featureImage/${featureImageFileName}`;
    }
    
    try {
        await pool.request()
            .input('eventID', sql.Int, eventID)
            .input('eventName', sql.NVarChar, eventName)
            .input('featureImage', sql.VarChar, publicFeatureImagePath)
            .input('startDateTime', sql.DateTime, startDateTime)
            .input('endDateTime', sql.DateTime, endDateTime) 
            .input('location', sql.VarChar, location)
            .input('description', sql.NVarChar, description)
            .input('category', sql.VarChar, category)
            .input('feedbackLink', sql.VarChar, feedbackLink)
            .input('requireApproval', sql.VarChar, requireApproval)
            .input('capacity', sql.Int, capacity)
            .input('allowWaitlist', sql.VarChar, allowWaitlist)
            .input('lastUpdated', sql.DateTime, lastUpdated)
            .query(`UPDATE eventsTable
                    SET 
                        eventName = @eventName,
                        featureImage = @featureImage,
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

// event management page
app.patch("/registrant", async (req, res) => {
    const { eventID, userID, status, approvedAt } = req.body

    try {
        await pool.request()
            .input('userID', sql.Int, userID)
            .input('status', sql.VarChar, status)
            .input('eventID', sql.Int, eventID)
            .input('approvedAt', sql.DateTime, approvedAt)
            .query(`UPDATE registrationTable
                    SET status = @status, approvedAt = @approvedAt
                    WHERE eventID = @eventID AND userID = @userID`)

        if (status === 'Declined') {
            try {
                const result = await pool.request()
                                .input('userID', sql.Int, userID)
                                .input('eventID', sql.Int, eventID)
                                .query(`SELECT * FROM attendeeTable WHERE eventID = @eventID AND userID = @userID`)

                const guest = result.recordset[0]

                if (guest != 0) {
                    try {
                        await pool.request()
                            .input('userID', sql.Int, userID) 
                            .input('eventID', sql.Int, eventID)
                            .query(`DELETE FROM attendeeTable WHERE eventID = @eventID AND userID = @userID`)
                        
                        console.log("Registration details update and Attendee detail removal successful")
                        res.status(200).json({ message : 'Registration details updated and Attendee details removed' })
                    }
                    catch (e) {
                        console.log("Registration details update and Attendee detail removal failed")
                        res.status(500).json({ message : 'Registration details update and Attendee details removal failed', error : e })
                    }
                }
            }
            catch (e) {
                console.log("Attendee extraction failed: ", e)
                return res.status(500).json({ message: 'Attendee extraction failed', error : e})
            }
        }

        console.log("Registration details update successful")
        res.status(200).json({ message : 'Registration details updated' })
    }
    catch (e) {
        console.log("Registration details update failed: ", e)
        res.status(500).json({ message : 'Registration details update failed:', error : e })
    }
});


// event management page
app.post("/checkin-attendee", async (req, res) => {
    const { eventID, userID, checkedInAt } = req.body

    try {
        await pool.request()
            .input('eventID', sql.Int, eventID)
            .input('userID', sql.Int, userID)
            .input('checkedInAt', sql.DateTime, checkedInAt)
            .query(`INSERT INTO attendeeTable (eventID, userID, checkedInAt)
                    VALUES (@eventID, @userID, @checkedInAt)`)

        console.log("Attendee details update success")
        res.status(201).json({ message : 'Attendee details insert success' })   
    }
    catch (e) {
        console.log("Attendee details update failed: ", e)
        res.status(500).json({ message : 'Attendee details insert failed:', error : e })   
    }
});

// event management page
app.delete("/checkin-attendee", async (req, res) => {
    let { eventID, userID } = req.body

    try {
        const result = await pool.request()
                .input('eventID', sql.Int, eventID)
                .input('userID', sql.Int, userID)
                .query(`SELECT * FROM attendeeTable WHERE eventID = @eventID AND userID = @userID`)

        const attendee = result.recordset[0]
        
        if (attendee) {
            try {
                await pool.request()
                    .input('eventID', sql.Int, eventID)
                    .input('userID', sql.Int, userID)
                    .query(`DELETE FROM attendeeTable WHERE eventID = @eventID AND userID = @userID`)

                console.log('Guest attendance removal success')
                res.status(200).json({ message: 'Guest attendance removal success'})
            }
            catch (e) {
                console.log("Guest attendance removal failed: ", e)
                res.status(500).json({ message : 'Guest attendance removal failed', error : e})
            }
        }
        else {
            console.log('Guest not found in attendeeTable')
            res.status(404).json({ message : 'Guest not found in attendeeTable'})
        }
    }
    catch (e) {
        console.log("Attendee details extraction failed: ", e)
        res.status(500).json({ message : 'Attendee details extraction failed', error : e})
    }
});

// event management page
app.delete("/delete-event", async (req, res) => {
    const { eventID } = req.body

    try {
        await pool.request()
            .input('eventID', sql.Int, eventID)
            .query(`DELETE FROM eventsTable WHERE eventID = @eventID`)

        console.log("Event deletion success")
        res.status(200).json({ message : 'Event deletion success' })
    }
    catch (e) {
        console.log("Event deletion failed: ", e)
        res.status(500).json({ message : 'Event deletion failed', error : e})
    }
});




// events page
app.get("/events-registered", async (req, res) => {
    const userID = req.session.user.id;

    try {
        const result = await pool.request()
            .input('userID', sql.Int, userID)
            .query(`SELECT eT.eventID, eT.startDateTime, eT.endDateTime,
                                                FORMAT(eT.startDateTime, 'MMMM d, h:mm tt') AS formattedStartDateTime,
                                                FORMAT(eT.startDateTime, 'h:mm tt') AS formattedStartTime,
                                                FORMAT(eT.endDateTime, 'MMMM d, h:mm tt') AS formattedEndDateTime,
                                                FORMAT(eT.endDateTime, 'h:mm tt') AS formattedEndTime,
                                                IIF(CAST(eT.startDateTime AS DATE) = CAST(eT.endDateTime AS DATE), 'True', 'False') AS sameDay,
                                                IIF(MONTH(eT.startDateTime) = MONTH(eT.endDateTime) AND YEAR(eT.startDateTime) = YEAR(eT.endDateTime), 'True', 'False') AS sameMonth,
                                                IIF(YEAR(eT.startDateTime) = YEAR(eT.endDateTime), 'True', 'False') AS sameYear,
                                                uT.profilePic, uT.fullName, eT.eventName, eT.description, eT.location, 
                                                eT.featureImage, eT.feedbackLink, eT.themeIndex, rT.status
                                        FROM ((eventsTable eT
                                        INNER JOIN registrationTable rT ON eT.eventID = rt.eventID)
                                        INNER JOIN userTable uT ON eT.creatorID = uT.userID)
                                        WHERE rT.userID = @userID`)

        const eventsData = result.recordset.map(event => ({
            eventID: event.eventID,
            profilePic: event.profilePic,
            fullName: event.fullName,
            eventName: event.eventName,
            startDateTime: event.startDateTime,
            endDateTime: event.endDateTime,
            formattedStartDateTime: event.formattedStartDateTime,
            formattedStartTime: event.formattedStartTime,
            formattedEndDateTime: event.formattedEndDateTime,
            formattedEndTime: event.formattedEndTime,
            sameDay: event.sameDay,
            sameMonth: event.sameMonth,
            sameYear: event.sameYear,
            description: event.description,
            location: event.location,
            featureImage: event.featureImage,
            feedbackLink: event.feedbackLink,
            themeIndex: event.themeIndex,
            status: event.status
        }))

        console.log("Event registration cancelled.")
        return res.status(200).json(eventsData)
    }
    catch (e) {
        console.log("Events registered extraction failed: ", e)
        return res.status(500).json({ message: 'Events registered extration failed', error: e })
    }
});

app.get('/api/past-events', async (req, res) => {
    const userID = req.session.user.id;

    try {
       const result = await pool.request()
       .input('userID', sql.Int, userID)
       .query(`SELECT r.* FROM registrationTable r
        JOIN eventsTable e ON r.eventID = e.eventID 
        WHERE r.userID = @userID AND e.endDateTime < GETDATE();`);

        res.json(result.recordset);
        console.log("past events fetched successfully!");
    }
    catch(err){
        console.error("Error fetching past events");

    }

    
});

app.get('/logout', (req, res)=>{
    req.session = null; // clears the session

    res.redirect('/');
});

server.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});