/*===================================*/
/*=========SOCKET FUNCTIONS==========*/
/*===================================*/
const socket = io("http://localhost:3335");

function sendMessage() {
  socket.emit("send_message", "message from user!");
}

socket.on("receive_message", (data) => {
  console.log("Received message from server:", data);
});
/*===================================*/
/*=========COMMON VARIABLES==========*/
/*===================================*/

let mainContainer = document.querySelector(".main_container");
let callRoomContainer = document.querySelector(".callRoom_container");

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
//gets callback from back about joining room
socket.on("joinedRoom", (data) => {
  console.log(data);
});

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
}
