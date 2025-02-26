/*===================================*/
/*=========SOCKET FUNCTIONS==========*/
/*===================================*/
socket = io("http://localhost:3335");

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

socket.on("agoraToken", async (token) => {
  console.log("agoraToken=", token);

  // Check if the local stream is initialized
  if (!localStream) {
    localStream = AgoraRTC.createMicrophoneAndCameraTracks({
      audio: true,
      video: true,
      screen: false, // Set to true if you want screen sharing
    });
  }

  // Initialize the stream (this accesses the local camera and microphone)
  // Join the channel
  client.join(
    token,
    "your-channel-name",
    null,
    (uid) => {
      console.log("User " + uid + " joined the channel");

      // Publish the local stream to the channel
      client.publish(localStream, (err) => {
        console.error("Failed to publish local stream:", err);
      });
    },
    (err) => {
      console.error("Failed to join channel:", err);
    }
  );
});

/*===================================*/
/*=========COMMON VARIABLES==========*/
/*===================================*/

JoinedRoomId = "";
let mainContainer = document.querySelector(".main_container");
let callRoomContainer = document.querySelector(".callRoom_container");
let videoInputs = document.querySelector(".videoInputs");
let newUserInterface = document.createElement("div");
let client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
let localStream;
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
/*======================*/
/*========AGORA=========*/
/*======================*/

client.on("stream-added", (evt) => {
  let remoteStream = evt.stream;
  console.log("New stream added: " + remoteStream.getId());

  // Subscribe to the remote stream
  client.subscribe(remoteStream, (err) => {
    console.error("Error subscribing to remote stream:", err);
  });
});

// When the remote stream is published, play it
client.on("stream-subscribed", (evt) => {
  let remoteStream = evt.stream;
  console.log("Subscribed to remote stream: " + remoteStream.getId());

  // Play the remote stream
  remoteStream.play("remote-stream");
});
