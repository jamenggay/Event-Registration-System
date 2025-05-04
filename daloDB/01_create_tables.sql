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
