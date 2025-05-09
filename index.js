import express from "express";
import { dirname } from "path";
import path from "path";
import { fileURLToPath } from "url";
import { pool, sql } from "./db-connection.js";
import multer from "multer";

//potek isahang import lang pala yung pool tsaka sql para magconnect kaines

//declaring app
const app = express();
const __dirname = dirname(fileURLToPath(import.meta.url));
const port = 3000;

//middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
const upload = multer({ dest : path.join(__dirname, 'public', 'assets') })

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "index.html"));
})

// app.post("/register", async (req, res) => {
//     const { email, mobileNum, fullName, userName, password } = req.body;

//     try {
//         await pool.request()
//             .input('email', sql.VarChar, email)
//             .input('mobileNum', sql.VarChar, mobileNum)
//             .input('fullName', sql.VarChar, fullName)
//             .input('userName', sql.VarChar, userName)
//             .input('password', sql.VarChar, password)
//             .query('INSERT INTO userTable (email, mobileNumber, fullName, username, password) VALUES (@email, @mobileNum, @fullName, @userName, @password)');

//         res.json({ success: true, message: 'Registration successful!' });

//     }
//     catch (err) {
//         console.error("Error during registration:", err);
//         res.status(500).json({ message: 'Registration Failed' });
//     }
// });

// app.post("/login", async (req, res) => {
//     const { userName, password } = req.body;

//     try {
//         const result = await pool.request()
//             .input('userName', sql.VarChar, userName)
//             .query('SELECT * FROM userTABLE WHERE username = @userName')

//         const user = result.recordset[0]; //stores the result to user variable
        
//         //login validation

//         if (!user) {
//             return res.json({ success: false, message: "Incorrect username or password!" });
//         }

//         if (user.password !== password) {
//             return res.json({ success: false, message: "Incorrect username or password!" });
//         }
//         return res.json({ success: true, message: "Login success!" });

//     }
//     catch (err) {
//         console.error(err);
//         res.status(500).json({ message: 'Server Error' })
//     }
// });

app.get("/create-event", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "create-events.html"))
})

app.post("/create-event", upload.single('event-photo'), async (req, res) => {
    const featureImage = req.file.path

    const { 'event-name' : eventName,
            'start-date' : startDate,
            'start-time' : startTime,
            'end-date' : endDate,
            'end-time' : endTime,
            'event-location' : eventLocation,
            'event-description' : eventDescription,
            'event-category' : eventCategory,
            'event-feedback' : eventFeedback,
            'event-capacity' : eventCapacity,
        } = req.body

    const startDateTime  = new Date(new Date(`${startDate}T${startTime}`).getTime() + (8 * 60 * 60 * 1000));
    const endDateTime = new Date(new Date(`${endDate}T${endTime}`).getTime() + (8 * 60 * 60 * 1000));
    const requireApproval = req.body['require-approval'] === 'on' ? 'Yes' : 'No'
    const waitlistToggle = req.body['waitlist-toggle'] === 'on' ? 'Yes' : 'No'
    const lastUpdated = new Date(new Date().getTime() + (8 * 60 * 60 * 1000));

    try {
        await pool.request()
            .input('eventName', sql.VarChar, eventName)
            .input('eventDescription', sql.VarChar, eventDescription)
            .input('eventLocation', sql.VarChar, eventLocation)
            .input('startDateTime', sql.DateTime, startDateTime)
            .input('endDateTime', sql.DateTime, endDateTime) 
            .input('featureImage', sql.VarChar, featureImage)
            .input('requireApproval', sql.VarChar, requireApproval)
            .input('capacity', sql.Int, eventCapacity)
            .input('feedbackLink', sql.VarChar, eventFeedback)
            .input('lastUpdated', sql.DateTime, lastUpdated)
            .query(`INSERT INTO eventsTable (eventName, description, location, startDateTime, endDateTime, featureImage, requireApproval, capacity, feedbackLink, lastUpdated) 
                    VALUES (@eventName, @eventDescription, @eventLocation, @startDateTime, @endDateTime, @featureImage, @requireApproval, @capacity, @feedbackLink, @lastUpdated)`)

        console.log(res.json({ success: true, message: 'Event creation successful' }))
    }
    catch (error) {
        console.log("Event Creation Error: ", error)
        res.status(500).json({ message: 'Even Creation failed' });
        // console.log(res.json({ message: 'Even Creation failed' }))
    }
})

app.get("/events", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "views", "events.html"))
})

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});