import sql from "mssql/msnodesqlv8.js";

const config = {
  driver: "msnodesqlv8",
  connectionString: "Driver={ODBC Driver 17 for SQL Server};Server=localhost;Database=daloDB;Trusted_Connection=yes;TrustServerCertificate=yes;" //ANG ARTE KAILNGAN NASA CONNECTION STRING?!
};

  let pool;

try {
  pool = await sql.connect(config);
  console.log("connected");
} catch (err) {
  console.error("failed:", err.message);
}

export { pool, sql }; 