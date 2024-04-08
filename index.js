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
  multipleStatements: true // allows executing multiple SQL statements in a single query
});

// Function to execute a SQL query
function executeQuery(sql, args) {
  return new Promise((resolve, reject) => {
    pool.query(sql, args, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
}

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

const array = [
  2, 20, 2, 30, 2, 60, 10, 2, 3, 18, 2, 17, 12, 40, 10, 2, 5, 3, 2, 2, 12, 13,
  10, 2, 2, 2, 20, 50, 2, 2,
];

function generateAndSendMessage() {
  const value = Math.floor(Math.random() * array.length - 1) + 1;
  const time = array[value] || 12;
  io.emit("message", time);

  let fly_time = 0;
  let milliseconds = 0;
  let seconds = 0;

  io.emit("setloder", false);
  io.emit("isFlying", true);

  const timerInterval = setInterval(() => {
    if (milliseconds === 100) {
      seconds += 1;
      milliseconds = 0;
    }

    io.emit("seconds", `${String(milliseconds).padStart(2, "0")}_${seconds}`);
    const newTime = fly_time + 1;

    if (newTime >= time * 1000) {
      clearInterval(timerInterval);
      fly_time = 0;
      milliseconds = 0;
      seconds = 0;
    }

    milliseconds += 1;
    fly_time = newTime;
  }, 100);

  setTimeout(() => {
    io.emit("isFlying", false);
    clearInterval(timerInterval);
  }, time * 1000);

  setTimeout(() => {
    clearInterval(timerInterval);
    io.emit("setcolorofdigit", true);
  }, (5 + ((time - 5) / 5 - 0.3) * 5) * 1000);

  setTimeout(() => {
    io.emit("setcolorofdigit", false);
    io.emit("setloder", true);
  }, time * 1000 + 3000);

  setTimeout(generateAndSendMessage, time * 1000 + 8000);
}

// color prediction game time generated every 1 min
function generatedTimeEveryAfterEveryOneMin() {
  let seconds = 59;
  const interval = setInterval(() => {
    io.emit("onemin", seconds);
    // console.log("time",seconds);
    seconds--;
    if (seconds < 0) {
      seconds = 59;
      clearInterval(interval);
      generatedTimeEveryAfterEveryOneMin();
    }
  }, 1000);
}

// color prediction game time generated every 3 min
const generatedTimeEveryAfterEveryThreeMin = () => {
  let min = 2;
  let sec = 59;

  const interval = setInterval(() => {
    io.emit("threemin", `${min}_${sec}`);
    sec--;

    if (sec < 0) {
      sec = 59;
      min--;

      if (min < 0) {
        sec = 59;
        min = 2;
        clearInterval(interval);
        generatedTimeEveryAfterEveryThreeMin();
      }
    }
  }, 1000);
};

const generatedTimeEveryAfterEveryFiveMin = () => {
  let min = 4;
  let sec = 59;

  const interval = setInterval(() => {
    io.emit("fivemin", `${min}_${sec}`);

    sec--;

    if (sec < 0) {
      sec = 59;
      min--;

      if (min < 0) {
        sec = 59;
        min = 4;
        clearInterval(interval);
        generatedTimeEveryAfterEveryFiveMin();
      }
    }
  }, 1000);
};

// Schedule the function to run daily at 12:00 AM 0 0 * * *
const job = schedule.scheduleJob("*/5 * * * *", async function () {
  try {
    // Make the API call using axios
    const response = await axios.get(
      "https://admin.gameszone.life/api/wallet-income"
    );
    response &&
      setTimeout(async () => {
        try {
          await axios.get("https://admin.gameszone.life/api/bet-income");
        } catch (e) {
          console.log(e);
        }
      }, 1000);
    response &&
      setTimeout(async () => {
        try {
          await axios.get("https://admin.gameszone.life/api/direct-income");
        } catch (e) {
          console.log(e);
        }
      }, 3000);
  } catch (error) {
    console.error("Error:", error.message);
  }
});

let x = true;
// io.on("connection", (socket) => {
//   if (x) {
//     console.log("Functions called");
//     generateAndSendMessage();
//     generatedTimeEveryAfterEveryOneMin();
//     generatedTimeEveryAfterEveryThreeMin();
//     generatedTimeEveryAfterEveryFiveMin();
//     x = false;
//   }
// });

app.get("/", (req, res) => {
  res.send(`<h1>This is simple port which is running at -====> ${PORT}</h1>`);
});

httpServer.listen(PORT, () => {
  console.log("Server listening on port", PORT);
});
