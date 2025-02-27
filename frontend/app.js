// import AgoraRTC from "agora-rtc-sdk-ng";
// import appId from "./appId";
/*==================================*/
/*=========AGORA FUNCTIONS==========*/
/*==================================*/
const appId = "31417420be70429992b3c56cf9c74dda";
const token = null;
const rtcUid = Math.floor(Math.random() * 2032);
let roomId = "main";
let audioTracks = {
  localAudioTrack: null,
  remoteAudioTracks: {},
};
let rtcClient;
let initRtc = async () => {
  rtcClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  rtcClient.on("user-joined", handleUserJoined);
  rtcClient.on("user-published", handleUserPublished);
  await rtcClient.join(appId, roomId, token, rtcUid);

  audioTracks.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();

  rtcClient.publish(audioTracks.localAudioTrack);
};
let leaveRtc = async () => {
  audioTracks.localAudioTrack.stop();
  audioTracks.localAudioTrack.close();

  rtcClient.unpublish();
  rtcClient.leave();
};
let handleUserJoined = async (user) => {
  console.log("User Joined:", user);
};
let handleUserPublished = async (user, mediaType) => {
  await AgoraRTC.subscribe(user, mediaType);
  if (mediaType === "audio") {
    audioTracks.remoteAudioTracks[user.uid] = [user.audioTracks];
    user.audioTracks.play();
  }
};
/*===================================*/
/*=========SOCKET FUNCTIONS==========*/
/*===================================*/
let socket = io("http://localhost:3335");

//gets callback from back about joining room
socket.on("joinedRoom", (data) => {
  console.log("===============join==================");
  JoinedRoomId = data.JoinedRoom;
  console.log(data);
  createUserinterface(data.roomMembers);
});
//gets callback from back about leaving room
socket.on("leavedRoom", (data) => {
  console.log("===============leave==================");
  console.log(data);
  deleteUserinterface(data.clientId, data.roomMembers);
});

/*===================================*/
/*=========COMMON VARIABLES==========*/
/*===================================*/

let JoinedRoomId = "";
let mainContainer = document.querySelector(".main_container");
let callRoomContainer = document.querySelector(".callRoom_container");
let videoInputs = document.querySelector(".videoInputs");
let newUserInterface = document.createElement("div");

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
  if (localStream) {
    if (bool) {
      cameraBtnTurnedOn.classList.add("inactive");
      cameraBtnTurnedOn.classList.remove("active");
      cameraBtnTurnedOff.classList.add("active");
      cameraBtnTurnedOff.classList.remove("inactive");
      localStream.muteVideo(false);
    } else {
      cameraBtnTurnedOn.classList.remove("inactive");
      cameraBtnTurnedOn.classList.add("active");
      cameraBtnTurnedOff.classList.add("inactive");
      cameraBtnTurnedOff.classList.remove("active");
      localStream.muteVideo(true);
    }
  } else {
    console.error("Local stream is not initialized");
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
  if (localStream) {
    if (bool) {
      microBtnTurnedOn.classList.add("inactive");
      microBtnTurnedOn.classList.remove("active");
      microBtnTurnedOff.classList.add("active");
      microBtnTurnedOff.classList.remove("inactive");
      microMuteAudio.load();
      microMuteAudio.play();
      localStream.muteAudio(false);
    } else {
      microBtnTurnedOn.classList.remove("inactive");
      microBtnTurnedOn.classList.add("active");
      microBtnTurnedOff.classList.add("inactive");
      microBtnTurnedOff.classList.remove("active");
      microUnmuteAudio.load();
      microUnmuteAudio.play();
      localStream.muteAudio(true);
    }
  } else {
    console.error("Local stream is not initialized");
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
  leaveRtc();
}
function createUserinterface(roomMembers) {
  for (let user of roomMembers) {
    //check if clientInterface is already displayed
    const isInterfaceGenerated = [...videoInputs.children].find(
      (child) => user.id === child.id
    );
    if (roomMembers.length === 1 && !isInterfaceGenerated) {
      while (videoInputs.firstChild) {
        videoInputs.removeChild(videoInputs.firstChild);
      }
      console.log("videoInput:", videoInputs);
    }

    if (!isInterfaceGenerated) {
      //random color generate
      let UserColor = user.color;
      let newUserInterface = document.createElement("div");
      newUserInterface.classList.add("video_box");
      newUserInterface.style.backgroundColor = UserColor;
      newUserInterface.id = user.id;
      const changedUserColorForImg = modifyRGBBySubtracting(UserColor);
      console.log(changedUserColorForImg);
      newUserInterface.innerHTML = `
      <div
      style="background-color:${changedUserColorForImg};"
      class="user_Img">
      </div>`;
      videoInputs.appendChild(newUserInterface);
      initRtc();
    }
  }
}
function deleteUserinterface(clientId, roomMembers) {
  const isInterfaceGenerated = [...videoInputs.children].find(
    (child) => clientId === child.id
  );
  // console.log(isInterfaceGenerated);
  console.log(0);
  if (isInterfaceGenerated) {
    // console.log(clientId);
    let removedChild = document.getElementById(`${clientId}`);
    console.log(1);
    if (!roomMembers) {
      console.log(2);
      console.log(roomMembers);
      while (videoInputs.firstChild) {
        videoInputs.removeChild(videoInputs.firstChild);
      }
    } else {
      console.log(3);
      videoInputs.removeChild(removedChild);
    }
  }
}
function modifyRGBBySubtracting(rgbaColor) {
  const regex = /rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/;

  if (regex.test(rgbaColor)) {
    // Extract the RGB values and alpha
    const [, r, g, b, a] = rgbaColor.match(regex);

    // Subtract 15 from each RGB value, ensuring it stays within 0-255 range
    const adjustValue = (value) => {
      return Math.max(parseInt(value) - 105, 0); // Ensure the value is at least 0
    };
    const newR = adjustValue(r);
    const newG = adjustValue(g);
    const newB = adjustValue(b);
    return `rgba(${newR}, ${newG}, ${newB}, ${a})`;
  }
  return rgbaColor;
}
