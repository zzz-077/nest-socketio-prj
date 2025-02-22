/*===================================*/
/*=========SOCKET FUNCTIONS==========*/
/*===================================*/
socket = io("http://localhost:3335");

//gets callback from back about joining room
socket.on("joinedRoom", (data) => {
  JoinedRoomId = data.JoinedRoom;
  // console.log(data);
  createUserinterface(data.roomMembers);
});
//gets callback from back about leaving room
socket.on("leavedRoom", (data) => {
  // console.log(data);
  deleteUserinterface(data.clientId, data.roomMembers);
});
/*===================================*/
/*=========COMMON VARIABLES==========*/
/*===================================*/
JoinedRoomId = "";
let mainContainer = document.querySelector(".main_container");
let callRoomContainer = document.querySelector(".callRoom_container");
let videoInputs = document.querySelector(".videoInputs");
let newUserInterface = document.createElement("div");
const userInterfaceColorsArray = [
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF", // Basic colors
  "#FFB3BA",
  "#FFDFBA",
  "#FFFFBA",
  "#BAFFC9",
  "#BAE1FF", // Pastel colors
  "#1B1B1B",
  "#2C2C2C",
  "#3D3D3D",
  "#4E4E4E",
  "#5F5F5F", // Dark tones
  "#E63946",
  "#F4A261",
  "#2A9D8F",
  "#264653",
  "#8AB17D", // Vibrant colors
];
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
  if (JoinedRoomId) {
    console.log("Leaving room:", JoinedRoomId);
    socket.emit("leaveRoom", JoinedRoomId);
  } else {
    console.log("No room joined yet");
  }
  mainContainer.classList.remove("disable");
  callRoomContainer.classList.remove("enable");
}
function createUserinterface(roomMembers) {
  for (let id of roomMembers) {
    //check if clientInterface is already displayed
    const isInterfaceGenerated = [...videoInputs.children].find(
      (child) => id === child.id
    );
    console.log(isInterfaceGenerated);
    if (!isInterfaceGenerated) {
      //random color generate
      const randomColorPicker = Math.floor(Math.random() * 22);
      let newUserInterface = document.createElement("div");
      newUserInterface.classList.add("video_box");
      newUserInterface.style.backgroundColor =
        userInterfaceColorsArray[randomColorPicker];
      newUserInterface.id = id;
      newUserInterface.innerHTML = `
      <div  class="user_Img">
      <p>Client</p>
      </div>`;
      videoInputs.appendChild(newUserInterface);
    }
  }
}
function deleteUserinterface(clientId, roomMembers) {
  if (Array.isArray(roomMembers) && roomMembers.length != 0) {
    for (let id of roomMembers) {
      // console.log(id);
      //check if clientInterface is already displayed
      const isInterfaceGenerated = [...videoInputs.children].find(
        (child) => id === child.id
      );
      // console.log(isInterfaceGenerated);
      if (isInterfaceGenerated) {
        // console.log(clientId);
        let removedChild = document.getElementById(`${clientId}`);
        videoInputs.removeChild(removedChild);
      }
    }
  } else {
    let removedChild = document.getElementById(`${clientId}`);
    videoInputs.removeChild(removedChild);
  }
}
