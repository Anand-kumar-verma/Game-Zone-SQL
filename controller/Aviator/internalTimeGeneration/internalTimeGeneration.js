
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = new Server(server);

exports.startFly = (randomFlyingTime) => {
  console.log("start fly function is called");
  let time = 0;
  let seconds = Math.floor((time / 1000) % 100);

  const timerInterval = setInterval(() => {
    let milliseconds = String(time % 1000)
      .padStart(3, "0")
      .substring(0, 2);
    io.emit("milliseconds", milliseconds);
    const newTime = time + 1;
    if (newTime >= randomFlyingTime * 1000) {
      time = 0;
      milliseconds = 0;
      seconds = 0;
      io.emit("seconds", seconds);
      io.emit("milliseconds", milliseconds);
      clearInterval(timerInterval);
    } else if (milliseconds >= 100) {
      seconds += 1;
      io.emit("seconds", seconds);
      milliseconds = 0;
    }
    time = newTime;
  }, 10);
  setTimeout(() => {
    clearInterval(timerInterval);
  }, (randomFlyingTime) * 1000);
  // return () => clearInterval(timerInterval);
};
