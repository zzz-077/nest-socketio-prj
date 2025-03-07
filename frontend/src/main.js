import AgoraRTC from "agora-rtc-sdk-ng";
import appId from "./appId";
/*==================================*/
/*=========AGORA FUNCTIONS==========*/
/*==================================*/
const token = null;
const rtcUid = Math.floor(Math.random() * 2032);
// let roomId = "";
let audioTracks = {
  localAudioTrack: null,
  remoteAudioTracks: {},
};
let videoTracks = {
  localVideoTrack: null,
  remoteVideoTracks: {},
};
let rtcClient;
let userSocketId = "";

let initRtc = async (roomId) => {
  if (roomId) {
    rtcClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    rtcClient.on("user-joined", handleUserJoined);
    rtcClient.on("user-published", handleUserPublished);
    rtcClient.on("user-unpublished", handleUserUnPublished);

    rtcClient.on("user-left", handleUserLeft);

    // console.log("ROOMID= ", roomId);
    await rtcClient.join(appId, roomId, token, rtcUid);

    //create audio&Publish
    audioTracks.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    rtcClient.publish(audioTracks.localAudioTrack);
    initVolumeIndicator();
  } else {
    // console.log("NO ROOMID!");
  }
};
let leaveRtc = async () => {
  // Stop and close audio track if exists
  if (audioTracks.localAudioTrack) {
    audioTracks.localAudioTrack.stop();
    audioTracks.localAudioTrack.close();
  }

  // Stop and close video track if exists
  if (videoTracks.localVideoTrack) {
    videoTracks.localVideoTrack.stop();
    videoTracks.localVideoTrack.close();
    // rtcClient.unpublish(videoTracks.localVideoTrack);
    // videoTracks.localVideoTrack = null;
    // console.log("LEAVE:", videoTracks);
  }
  rtcClient.unpublish();
  rtcClient.leave();
};
let handleUserJoined = async (user) => {
  // console.log("User Joined:", user);
};
let handleUserPublished = async (user, mediaType) => {
  // console.log("User Published:", user.uid);
  await rtcClient.subscribe(user, mediaType);
  if (mediaType === "audio") {
    audioTracks.remoteAudioTracks[user.uid] = [user.audioTrack];
    user.audioTrack.play();
  }
  if (mediaType === "video") {
    videoTracks.remoteVideoTracks[user.uid] = [user.videoTracks];
    let remoteVideoContainer = document.getElementsByClassName(
      `user-${user.uid}`
    )[0];
    // console.log("remoteVideoContainer:", remoteVideoContainer);
    // remoteVideoContainer.innerHTML = "";
    remoteVideoContainer.children[0].style.display = "none";
    user.videoTrack.play(remoteVideoContainer);
  }
};
let handleUserUnPublished = async (user, mediaType) => {
  // console.log("UNPUBLISHED");
  if (mediaType === "video") {
    let remoteVideoContainer = document.getElementsByClassName(
      `user-${user.uid}`
    )[0];
    remoteVideoContainer.children[0].style.display = "flex";
  }
};
let handleUserLeft = async (user) => {
  delete audioTracks.remoteAudioTracks[user.uid];
  delete videoTracks.remoteVideoTracks[user.uid];
};
let initVolumeIndicator = async (user) => {
  AgoraRTC.setParameter("AUDIO_VOLUME_INDICATION_INTERVAL", 200);
  rtcClient.enableAudioVolumeIndicator();
  rtcClient.on("volume-indicator", (volume) => {
    volume.forEach((volume) => {
      let userBox = document.getElementsByClassName(`user-${volume.uid}`)[0];
      // console.log("VOLUME= ", volume.level);
      if (volume.level > 40) {
        // console.log("talking");
        userBox.style.borderColor = "#00ff00";
      } else {
        // console.log("not talking");
        userBox.style.borderColor = "#00000000";
      }
    });
  });
};
/*===================================*/
/*=========SOCKET FUNCTIONS==========*/
/*===================================*/
let socket = io("https://nest-socketio-prj.onrender.com", {
  transports: ["polling"],
});

//gets callback from back about joining room
socket.on("joinedRoom", (data) => {
  // console.log("===============join==================", data);
  JoinedRoomId = data.JoinedRoom;
  while (videoInputs.firstChild) {
    videoInputs.removeChild(videoInputs.firstChild);
  }
  createUserinterface(data.roomMembers);
  let loader = document.querySelector(".loader");
  loader.style.display = "none";
});
//gets callback from back about leaving room
socket.on("leavedRoom", (data) => {
  // console.log("===============leave==================", data);
  deleteUserinterface(data.clientId, data.roomMembers);
});
socket.on("joinedClientInRoomLocalData", (data) => {
  // console.log("===============JOINED LOCALLY==================");
  userSocketId = data.clientId;
  const userBox = document.getElementById(userSocketId);
  // console.log("userBox=", userBox);
  if (userBox) {
    initRtc(JoinedRoomId);
  }
});

/*===================================*/
/*=========COMMON VARIABLES==========*/
/*===================================*/
let JoinedRoomId = "";
let mainContainer = document.querySelector(".main_container");
let callRoomContainer = document.querySelector(".callRoom_container");
let videoInputs = document.querySelector(".videoInputs");
let cameraBtnTurnedOn = document.getElementsByClassName("videoBtns")[0];
let cameraBtnTurnedOff = document.getElementsByClassName("videoBtns")[1];
document.addEventListener("DOMContentLoaded", () => {
  let StartCallButton = document.querySelector(".button_box button");
  let leaveButton = document.querySelector(".leaveCallBtn button");
  const cameraButtons = document.querySelectorAll(".videoBtns");
  cameraButtons[0].addEventListener("click", () => CameraBtnClick(true));
  cameraButtons[1].addEventListener("click", () => CameraBtnClick(false));

  const microButtons = document.querySelectorAll(".microBtns");
  microButtons[0].addEventListener("click", () => MicroBtnClick(true));
  microButtons[1].addEventListener("click", () => MicroBtnClick(false));

  if (StartCallButton) {
    StartCallButton.addEventListener("click", StartCallBtnClick);
  }

  if (leaveButton) {
    leaveButton.addEventListener("click", LeaveBtnClick);
  }
});

/*===================================*/
/*==========MAIN FUNCTIONS===========*/
/*===================================*/
//joins user in room
function StartCallBtnClick() {
  socket.emit("joinRoom", rtcUid);
  mainContainer.classList.add("disable");
  callRoomContainer.classList.add("enable");
  let startAudio = new Audio();
  startAudio.src = "/sounds/discord-join.mp3";
  startAudio.load();
  startAudio.play();
  let loader = document.querySelector(".loader");
  loader.style.display = "flex";
}
/*===================================*/
/*========CALLROOM FUNCTIONS=========*/
/*===================================*/

async function CameraBtnClick(bool) {
  let cameraAudio = new Audio();
  let localVideoContainer = document.getElementById(userSocketId);

  if (bool) {
    //disable camera
    if (videoTracks.localVideoTrack) {
      videoTracks.localVideoTrack.stop();
      videoTracks.localVideoTrack.close();
      rtcClient.unpublish(videoTracks.localVideoTrack);
      videoTracks.localVideoTrack = null;
      localVideoContainer.children[0].style.display = "flex";
    }
    cameraBtnTurnedOn.classList.add("inactive");
    cameraBtnTurnedOn.classList.remove("active");
    cameraBtnTurnedOff.classList.add("active");
    cameraBtnTurnedOff.classList.remove("inactive");
  } else {
    //check if camera doesnot exist
    let devices = await AgoraRTC.getCameras();
    if (devices.length === 0) {
      console.error("No camera found!");
      localVideoContainer.children[0].style.display = "flex";
    } else {
      //create camera locally
      if (!videoTracks.localVideoTrack) {
        videoTracks.localVideoTrack = await AgoraRTC.createCameraVideoTrack();
        await rtcClient.publish(videoTracks.localVideoTrack);
        if (localVideoContainer) {
          localVideoContainer.children[0].style.display = "none";
          videoTracks.localVideoTrack.play(localVideoContainer);
        }
      }
    }

    cameraBtnTurnedOn.classList.remove("inactive");
    cameraBtnTurnedOn.classList.add("active");
    cameraBtnTurnedOff.classList.add("inactive");
    cameraBtnTurnedOff.classList.remove("active");
  }

  cameraAudio.src = "/sounds/discord-video-share.mp3";
  cameraAudio.load();
  cameraAudio.play();
}
function MicroBtnClick(bool) {
  let microUnmuteAudio = new Audio();
  let microMuteAudio = new Audio();
  let microBtnTurnedOn = document.getElementsByClassName("microBtns")[0];
  let microBtnTurnedOff = document.getElementsByClassName("microBtns")[1];
  microMuteAudio.src = "/sounds/discord-mute.mp3";
  microUnmuteAudio.src = "/sounds/discord-unmute.mp3";
  if (bool) {
    microBtnTurnedOn.classList.add("inactive");
    microBtnTurnedOn.classList.remove("active");
    microBtnTurnedOff.classList.add("active");
    microBtnTurnedOff.classList.remove("inactive");
    microMuteAudio.load();
    microMuteAudio.play();
    audioTracks.localAudioTrack.setMuted(true);
  } else {
    microBtnTurnedOn.classList.remove("inactive");
    microBtnTurnedOn.classList.add("active");
    microBtnTurnedOff.classList.add("inactive");
    microBtnTurnedOff.classList.remove("active");
    microUnmuteAudio.load();
    microUnmuteAudio.play();
    audioTracks.localAudioTrack.setMuted(false);
  }
}
function LeaveBtnClick() {
  let leaveCallAudio = new Audio();
  leaveCallAudio.src = "/sounds/discord-leave.mp3";
  leaveCallAudio.load();
  leaveCallAudio.play();
  cameraBtnTurnedOn.classList.add("inactive");
  cameraBtnTurnedOn.classList.remove("active");
  cameraBtnTurnedOff.classList.add("active");
  cameraBtnTurnedOff.classList.remove("inactive");
  if (JoinedRoomId) {
    // console.log("Leaving room:", JoinedRoomId);
    socket.emit("leaveRoom", JoinedRoomId);
  } else {
    // console.log("No room joined yet");
  }
  mainContainer.classList.remove("disable");
  callRoomContainer.classList.remove("enable");
  leaveRtc();
}
function createUserinterface(roomMembers) {
  for (let user of roomMembers) {
    // console.log("USER", user);
    //check if clientInterface is already displayed
    const isInterfaceGenerated = [...videoInputs.children].find(
      (child) => user.id === child.id
    );
    if (roomMembers.length === 1 && !isInterfaceGenerated) {
      while (videoInputs.firstChild) {
        videoInputs.removeChild(videoInputs.firstChild);
      }
      // console.log("videoInput:", videoInputs);
    }

    if (!isInterfaceGenerated) {
      //random color generate
      let UserColor = user.color;
      let newUserInterface = document.createElement("div");
      newUserInterface.classList.add("video_box");
      newUserInterface.classList.add(`user-${user.rtcUid}`);
      newUserInterface.style.backgroundColor = UserColor;
      newUserInterface.id = user.id;
      const changedUserColorForImg = modifyRGBBySubtracting(UserColor);
      newUserInterface.innerHTML = `
      <div
      style="background-color:${changedUserColorForImg};"
      class="user_Img">
      </div>`;
      videoInputs.appendChild(newUserInterface);
    }
  }
}
function deleteUserinterface(clientId, roomMembers) {
  // console.log("clientId= ", clientId);
  // console.log("roomMembers= ", roomMembers);
  let removedChild = document.getElementById(`${clientId}`);
  // console.log(0);
  if (removedChild) {
    // console.log(clientId);
    // console.log(1);
    if (!roomMembers) {
      // console.log(2);
      // console.log(roomMembers);
      while (videoInputs.firstChild) {
        videoInputs.removeChild(videoInputs.firstChild);
      }
    } else {
      // console.log(3);
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
