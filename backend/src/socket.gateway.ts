import { Body } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { log } from 'console';
import { Server, Socket } from 'socket.io';
import { uid } from 'uid';

@WebSocketGateway({ cors: { origin: '*', credentials: true } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  roomsMap = new Map<string, { id: string; color: string; rtcUid: number }[]>();
  //join room
  @SubscribeMessage('joinRoom')
  JoinRoom(@ConnectedSocket() client: Socket, @Body() rtcUid: number) {
    console.log('=================join================');
    console.log('rtcUid:', rtcUid);

    const getRandomColor = this.createRandomColorGenerator();
    //store all rooms
    let checkRooms = this.server.sockets.adapter.rooms;
    let checkIfFreeRoomExists: boolean = false;
    //check if there is not created room yet
    for (let [room, ids] of checkRooms) {
      //if there is room
      if (room.length === 6) {
        if (ids.size === 1) {
          checkIfFreeRoomExists = true;
          client.join(room);
          const userGeneratedData = {
            id: client.id,
            color: getRandomColor,
            rtcUid: rtcUid,
          };
          //set user in Map
          this.roomsMap.get(room)?.push(userGeneratedData);
          this.server.to(room).emit('joinedRoom', {
            roomMembers: this.roomsMap.get(room),
            JoinedRoom: room,
          });
          client.emit('joinedClientInRoomLocalData', {
            clientId: client.id,
          });
          break;
        }
      }
    }
    //if  all room are busy already we have to create new room
    if (!checkIfFreeRoomExists) {
      //generate random room id
      const randomRoomId = uid(6);
      client.join(randomRoomId);
      //set user in Map
      this.roomsMap.set(randomRoomId, []);
      this.roomsMap
        .get(randomRoomId)
        ?.push({ id: client.id, color: getRandomColor, rtcUid: rtcUid });
      this.server.to(randomRoomId).emit('joinedRoom', {
        roomMembers: this.roomsMap.get(randomRoomId),
        JoinedRoom: randomRoomId,
      });
      client.emit('joinedClientInRoomLocalData', {
        clientId: client.id,
      });
    }
    console.log('room:', this.roomsMap);
  }
  //leave room
  @SubscribeMessage('leaveRoom')
  leaveRoom(@ConnectedSocket() client: Socket, @Body() roomId: string) {
    console.log('===============leave==================');
    let checkRooms = this.server.sockets.adapter.rooms;
    let getUsersFromRoom = checkRooms.get(roomId);
    // let usersInRoom = getUsersFromRoom ? Array.from(getUsersFromRoom) : [];
    // console.log(usersInRoom);
    //remove user from Map
    const updatedUsers =
      this.roomsMap.get(roomId)?.filter((user) => user.id !== client.id) || [];
    console.log(updatedUsers);
    if (updatedUsers.length > 0) {
      this.roomsMap.set(roomId, updatedUsers);
    } else {
      this.roomsMap.delete(roomId);
    }
    // console.log(updatedUsers);
    client.leave(roomId);
    this.server.to(roomId).emit('leavedRoom', {
      roomMembers: this.roomsMap.get(roomId),
      clientId: client.id,
      leavedRoom: roomId,
    });
    client.emit('leavedRoom', {
      roomMembers: this.roomsMap.get(roomId),
      clientId: client.id,
      leavedRoom: roomId,
    });
    console.log(this.roomsMap);
  }
  //connect clientSocket
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }
  //disconnect clientSocket
  handleDisconnect(client: Socket) {
    console.log('===============disconnect==================');
    //delete the only room where this client is joined
    for (let [room, users] of this.roomsMap) {
      users.forEach((user) => {
        if (user.id === client.id) {
          const updatedUsers =
            this.roomsMap.get(room)?.filter((data) => data.id !== client.id) ||
            [];
          // console.log('updatedUsers: ', updatedUsers);
          if (updatedUsers.length > 0) {
            this.roomsMap.set(room, updatedUsers);
          } else {
            this.roomsMap.delete(room);
          }
          this.server.to(room).emit('leavedRoom', {
            roomMembers: this.roomsMap.get(room),
            clientId: client.id,
            leavedRoom: room,
          });
        }
      });
    }
    console.log(this.roomsMap);
    console.log(`Client disconnected: ${client.id}`);
  }
  //random color generate for userData
  createRandomColorGenerator() {
    const userInterfaceColorsArray = [
      'rgba(255, 0, 0, 1)',
      'rgba(0, 255, 0, 1)',
      'rgba(0, 0, 255, 1)',
      'rgba(255, 255, 0, 1)',
      'rgba(255, 0, 255, 1)',
      'rgba(0, 255, 255, 1)', // Basic colors

      'rgba(255, 160, 122, 1)',
      'rgba(255, 215, 0, 1)',
      'rgba(255, 105, 180, 1)',
      'rgba(152, 251, 152, 1)',
      'rgba(135, 206, 250, 1)',
      'rgba(173, 216, 230, 1)', // Light & soft

      'rgba(255, 179, 186, 1)',
      'rgba(255, 223, 186, 1)',
      'rgba(255, 255, 186, 1)',
      'rgba(186, 255, 201, 1)',
      'rgba(186, 225, 255, 1)', // Pastels

      'rgba(242, 141, 53, 1)',
      'rgba(255, 175, 135, 1)',
      'rgba(255, 195, 160, 1)',
      'rgba(197, 225, 165, 1)',
      'rgba(212, 165, 165, 1)',
      'rgba(255, 221, 193, 1)', // Warm tones

      'rgba(230, 57, 70, 1)',
      'rgba(244, 162, 97, 1)',
      'rgba(42, 157, 143, 1)',
      'rgba(138, 177, 125, 1)',
      'rgba(255, 214, 224, 1)',
      'rgba(255, 218, 193, 1)', // Vibrant & warm

      'rgba(255, 235, 153, 1)',
      'rgba(181, 234, 215, 1)',
      'rgba(199, 206, 234, 1)',
      'rgba(246, 198, 234, 1)',
      'rgba(226, 240, 203, 1)',
      'rgba(245, 225, 253, 1)', // Soft pastels
    ];
    const randomNumber = Math.floor(
      Math.random() * userInterfaceColorsArray.length,
    );
    const getRandomColor = userInterfaceColorsArray[randomNumber];
    return getRandomColor;
  }
}
