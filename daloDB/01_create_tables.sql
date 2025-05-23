CREATE DATABASE daloDB;
USE daloDB;

CREATE TABLE userTable (
    userID INT PRIMARY KEY IDENTITY(1,1),
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    profilePic VARCHAR(255) NULL --only stores file path of the image. Image will be stored in a different folder 
);

CREATE TABLE eventsTable (
    eventID INT PRIMARY KEY IDENTITY(1,1),
    creatorID INT NOT NULL,
    eventName VARCHAR(100) NOT NULL,
    description TEXT,
    location VARCHAR(100),
    startDateTime DATETIME NOT NULL,
    endDateTime DATETIME NOT NULL,
    featureImage VARCHAR(255), -- like pfp, only stores filepath 
    requireApproval VARCHAR(3) CHECK (requireApproval IN ('Yes', 'No')),
    capacity INT,
    feedbackLink VARCHAR(255),
    lastUpdated DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (creatorID) REFERENCES userTable(userID)
);

CREATE TABLE registrationTable (
	registrationID INT PRIMARY KEY IDENTITY(1,1),
    eventID INT NOT NULL,
    userID INT NOT NULL,
	status VARCHAR(10) CHECK (status IN ('Pending', 'Approved', 'Declined')) NOT NULL DEFAULT 'Pending'

    FOREIGN KEY (eventID) REFERENCES eventsTable(eventID),
    FOREIGN KEY (userID) REFERENCES userTable(userID),
    CONSTRAINT UNIQUE_registration UNIQUE (eventID, userID) -- prevent duplicate registration per event per user
);

CREATE TABLE attendeeTable (
    attendanceID INT PRIMARY KEY IDENTITY(1,1),
    eventID INT NOT NULL,
    userID INT NOT NULL,
    checkedInAt DATETIME DEFAULT GETDATE(),

    FOREIGN KEY (eventID) REFERENCES eventsTable(eventID),
    FOREIGN KEY (userID) REFERENCES userTable(userID),
    CONSTRAINT UNIQUE_attendance UNIQUE (eventID, userID) -- prevent double attendance per event per user
);

CREATE TABLE feedbackTable (
    feedbackID INT PRIMARY KEY IDENTITY(1,1),
    eventID INT NOT NULL,
    userID INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5) NOT NULL,

    FOREIGN KEY (eventID) REFERENCES eventsTable(eventID),
    FOREIGN KEY (userID) REFERENCES userTable(userID),
    CONSTRAINT UNIQUE_feedback UNIQUE (eventID, userID) -- prevent duplicate feedback per user per event
);

--userTable ALTER (base on UI)
ALTER TABLE userTable
DROP COLUMN firstName, lastName;

ALTER TABLE userTable
ADD 
  fullName VARCHAR(100) NOT NULL,
  mobileNumber VARCHAR(20) NOT NULL;

--eventsTable ALTER (based on UI)
ALTER TABLE eventsTable
ADD
    category VARCHAR(15),
    allowWaitlist VARCHAR(3) CHECK (allowWaitlist IN ('Yes', 'No'));

--userTable ALTER (based on UI)
ALTER TABLE userTable
ADD 
  bio NVARCHAR(MAX) NULL;

--eventsTable ALTER (based on UI)
ALTER TABLE eventsTable
ADD
	themeIndex INT;

--eventsTable ALTER (Accept Unicode [special fonts or emojis])
ALTER TABLE eventsTable
ALTER COLUMN eventName NVARCHAR(100);

ALTER TABLE eventsTable
ALTER COLUMN description NVARCHAR(MAX);