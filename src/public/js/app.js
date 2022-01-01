const socket = io(); //자동적으로 서버(백엔드)의 socket.io와 연결시켜준다.
const welcome = document.querySelector("#welcome");
const room = document.querySelector("#room");
const idForm = welcome.querySelector("#enter");
const messageForm = room.querySelector("#msg");
const nickForm = room.querySelector("#nick");
const title = room.querySelector("h1");


room.hidden = true;

let roomName = "";

const addMessage = (message) => {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

const showRoom = (count) => {
    welcome.hidden = true;
    room.hidden = false;
    title.innerText = `Room ${roomName} (${count})`;
}

const handleNicknameSubmit = (event) => {
    event.preventDefault();
    const input = nickForm.querySelector("input");
    const nickname = input.value;
    socket.emit("nickname", nickname);
   

}

const handleRoomSubmit = (event) => {
    event.preventDefault();
    const input = idForm.querySelector("input");
    socket.emit("enter_room", input.value, showRoom); // room이라는 이벤트(타입)을 지정하고 인자를 보내줄 수 있다.
    roomName = input.value;
    input.value = "";
    
}

const handleMessageSubmit = (event) => {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    const message = input.value;
    socket.emit("new_message", message, roomName, () => {
        addMessage(`You : ${message}`);
    }); // room이라는 이벤트(타입)을 지정하고 인자를 보내줄 수 있다.
    input.value = "";
}


const handleWelcome = (nickname, count) => {
    console.log("enter!", count);
    addMessage(`${nickname} Entered!`);
    title.innerText = `Room ${roomName} (${count})`;

}

const handleBye = (nickname, count) => {
    console.log("out!", count);
    addMessage(`${nickname} Disconnected!`);
    title.innerText = `Room ${roomName} (${count})`;
}

const handleMessage = (msg) => {
    addMessage(msg);

}

const handleChangeRoom = (rooms) => {
    const roomList = welcome.querySelector("ul");
    roomList.innerHTML = "";
    rooms.forEach(room => {
        const li = document.createElement("li");
        li.innerText = room;
        roomList.append(li); 
    })
}


socket.on("welcome", handleWelcome);
socket.on("bye", handleBye);
socket.on("new_message", handleMessage);
socket.on("room_change", handleChangeRoom);

idForm.addEventListener("submit", handleRoomSubmit);
messageForm.addEventListener("submit", handleMessageSubmit);
nickForm.addEventListener("submit", handleNicknameSubmit )