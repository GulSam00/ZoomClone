import express from "express";
import http from "http";

import { Server } from "socket.io";
import { instrument } from '@socket.io/admin-ui';

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer, {
  cors : {
    origin : ["https://admin.socket.io"],
    credentials : true,
  },
});
instrument(wsServer, {
  auth : false,
});

const getPublicRoom = () => {
    const {sockets : {
      adapter : {sids, rooms},
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined)
      publicRooms.push(key);
  });
  return publicRooms;
}

const countRoom = (roomName) => {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size; // ? 
}

const getRoomMember = (roomName) => {
  console.log("member!");
  const room = wsServer.sockets.adapter.rooms.get(roomName);
  const arr = [];
  room.forEach((i) => arr.push(i));
  return arr;
}
const handleConnect = (socket) => {
  socket["nickname"] = "홍길동";
  // socket.onAny((event) => {
  //   console.log(event); // socket에 있는 모든 event를 확인한다.
  //   console.log(wsServer.sockets.adapter)
  // });
  socket.on("enter_room", (roomName,  callback) => {
    console.log(socket.id); // 3swFSswKMMCHUrRbAAAB의 의미. 
    console.log(socket.rooms); // 기본적으로 socket.id의 값이 들어간다.
    socket.join(roomName); // socket이 포함되어 있는 모든 방들을 확인한다.
    callback(countRoom(roomName));
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName)); // roomName 이라는 room에만 이벤트를 전송한다.
    wsServer.sockets.emit("room_change", getPublicRoom());
    socket.to(roomName).emit("member_change", getRoomMember(roomName));


    socket.on("disconnect", () => {
      wsServer.sockets.emit("room_change", getPublicRoom());
    }); // 모든 room에 event를 전송한다.

    
    socket.on("disconnecting", () => { // 소켓 연결이 끊기지 직전 실행
      socket.rooms.forEach(room => {  // 소켓이 소속되어 있는 모든 room에 대해 접근.
        socket.to(room).emit("bye", socket.nickname, countRoom(roomName) - 1); // 모든 room에 event를 보낸다.

      });
    }) 
  });
  socket.on("new_message", (msg, room, done) => {
    socket.to(room).emit("new_message", `${socket.nickname} : ${msg}`);
    done();
  });
  socket.on("nickname", (nick) => {
    socket["nickname"] = nick;
  });
}

wsServer.on("connection", handleConnect);

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000, handleListen);
