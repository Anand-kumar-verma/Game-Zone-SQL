const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const todoRoutes = require("./routes/todos");
require("dotenv").config();
const conn = require("./config/database");
const schedule = require("node-schedule");
const axios = require("axios");
const mysql = require("mysql");
const app = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
  },
});

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.use(express.json());

const PORT = process.env.PORT || 4000;

// try {
//   conn.connect((err) => {
//     if (err) {
//       console.error("Error connecting to the database:", err);
//     } else {
//       console.log("Connected to the database");
//     }
//   });
// } catch (e) {
//   console.error("Error:", e);
// }

// var db_config = {
//   host: process.env.HOST,
//   user: process.env.USER,
//   password: process.env.PASSWORD,
//   database: process.env.DATABASE_URL,
// };


// Create a connection pool
const pool = mysql.createPool({
  connectionLimit: 10, // maximum number of connections in the pool
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE_URL,
  multipleStatements: true, // allows executing multiple SQL statements in a single query
  connectTimeout: 10000 // 10 seconds timeout
});


// Example usage:
// (async () => {
//   try {
//     const results = await executeQuery('SELECT * FROM your_table');
//     console.log(results);
//   } catch (error) {
//     console.error('Error executing query:', error);
//   }
// })();

app.use("/api/v1", todoRoutes);

// Schedule the function to run daily at 12:00 AM 0 0 * * *
const job = schedule.scheduleJob("0 1 * * *", async function () {
  try {
    // Make the API call using axios
    const response = await axios.get(
      "https://admin.sunlottery.fun/api/wallet-income"
    );
    response &&
      setTimeout(async () => {
        try {
          await axios.get("https://admin.sunlottery.fun/api/bet-income");
        } catch (e) {
          console.log(e);
        }
      }, 1000);
    response &&
      setTimeout(async () => {
        try {
          await axios.get("https://admin.sunlottery.fun/api/direct-income");
        } catch (e) {
          console.log(e);
        }
      }, 3000);
  } catch (error) {
    console.error("Error:", error.message);
  }
});

let x = true;

app.get("/", (req, res) => {
  res.send(`<h1>This is simple port which is running at -====> ${PORT}</h1>`);
});

httpServer.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
