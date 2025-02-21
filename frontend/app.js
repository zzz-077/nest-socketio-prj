/*===================================*/
/*=========SOCKET FUNCTIONS==========*/
/*===================================*/
socket = io("http://localhost:3335");

//gets callback from back about joining room
socket.on("joinedRoom", (data) => {
  JoinedRoomId = data.JoinedRoom;
  console.log(data);
  if (!clientInRoom.has(data.room)) {
    clientInRoom.set(data.room, new Set());
  }
  clientInRoom.get(data.room).add(data.clientId);
  // console.log(clientInRoom);
  createUserinterface(data.clientId);
});
//gets callback from back about leaving room
socket.on("leavedRoom", (data) => {
  // JoinedRoomId = "";
  console.log(data);
  if (clientInRoom.has(data.roomId)) {
    let clients = clientInRoom.get(data.roomId);
    clients.delete(data.clientId); // Remove only this user

    if (clients.size === 0) {
      clientInRoom.delete(roomId); // Delete the room if it's empty
    }
  }

  deleteUserinterface(data.clientId);
});
/*===================================*/
/*=========COMMON VARIABLES==========*/
/*===================================*/
JoinedRoomId = "";
let mainContainer = document.querySelector(".main_container");
let callRoomContainer = document.querySelector(".callRoom_container");
let videoInputs = document.querySelector(".videoInputs");
let newUserInterface = document.createElement("div");
let clientInRoom = new Map();
/*===================================*/
/*==========MAIN FUNCTIONS===========*/
/*===================================*/
//joins user in room
function StartCallBtn() {
  socket.emit("joinRoom");
  mainContainer.classList.add("disable");
  callRoomContainer.classList.add("enable");
  let startAudio = new Audio();
  startAudio.src = "assets/sounds/discord-join.mp3";
  startAudio.load();
  startAudio.play();
}
/*===================================*/
/*========CALLROOM FUNCTIONS=========*/
/*===================================*/

function CameraBtnClick(bool) {
  let cameraAudio = new Audio();
  let cameraBtnTurnedOn = document.getElementsByClassName("videoBtns")[0];
  let cameraBtnTurnedOff = document.getElementsByClassName("videoBtns")[1];
  if (bool) {
    cameraBtnTurnedOn.classList.add("inactive");
    cameraBtnTurnedOn.classList.remove("active");
    cameraBtnTurnedOff.classList.add("active");
    cameraBtnTurnedOff.classList.remove("inactive");
  } else {
    cameraBtnTurnedOn.classList.remove("inactive");
    cameraBtnTurnedOn.classList.add("active");
    cameraBtnTurnedOff.classList.add("inactive");
    cameraBtnTurnedOff.classList.remove("active");
  }
  cameraAudio.src = "assets/sounds/discord-video-share.mp3";
  cameraAudio.load();
  cameraAudio.play();
}
function MicroBtnClick(bool) {
  let microUnmuteAudio = new Audio();
  let microMuteAudio = new Audio();
  let microBtnTurnedOn = document.getElementsByClassName("microBtns")[0];
  let microBtnTurnedOff = document.getElementsByClassName("microBtns")[1];
  microMuteAudio.src = "assets/sounds/discord-mute.mp3";
  microUnmuteAudio.src = "assets/sounds/discord-unmute.mp3";
  if (bool) {
    microBtnTurnedOn.classList.add("inactive");
    microBtnTurnedOn.classList.remove("active");
    microBtnTurnedOff.classList.add("active");
    microBtnTurnedOff.classList.remove("inactive");
    microMuteAudio.load();
    microMuteAudio.play();
  } else {
    microBtnTurnedOn.classList.remove("inactive");
    microBtnTurnedOn.classList.add("active");
    microBtnTurnedOff.classList.add("inactive");
    microBtnTurnedOff.classList.remove("active");
    microUnmuteAudio.load();
    microUnmuteAudio.play();
  }
}
function LeaveBtnClick() {
  let leaveCallAudio = new Audio();
  leaveCallAudio.src = "assets/sounds/discord-leave.mp3";
  leaveCallAudio.load();
  leaveCallAudio.play();
  mainContainer.classList.remove("disable");
  callRoomContainer.classList.remove("enable");
  if (JoinedRoomId) {
    console.log("Leaving room:", JoinedRoomId);
    socket.emit("leaveRoom", JoinedRoomId);
  } else {
    console.log("No room joined yet");
  }
}
function createUserinterface(clientId) {
  // let userImg = document.createElement("img");
  // userImg.src = "./assets/L.png";
  newUserInterface.classList.add("video_box");
  newUserInterface.id = clientId;
  newUserInterface.innerHTML = `
            <div class="user_Img">
              <img src="assets/L.png" alt="" />
            </div>`;
  videoInputs.appendChild(newUserInterface);
}
function deleteUserinterface(clientId) {
  // let child = videoInputs.firstChild;
  // console.log(child);
}
