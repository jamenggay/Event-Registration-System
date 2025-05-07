import sql from 'mssql'

const config = {
    user : 'rishaye',
    password : 'forworkpurposes',
    server : 'LAPTOP-7IVFRHU7\\SQLEXPRESS01',
    database : "daloDB",
    options : {
        encrypt : false,
        trustServerCertificate: true
    }
}

console.log("Connecting to database...")

sql.connect(config, (error) => {
    if (error) {
        console.log("Connection error: ", error)
    }
    
    console.log("Connection successful")
})