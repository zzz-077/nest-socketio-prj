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
  roomsMap = new Map<string, { id: string; color: string }[]>();
  //join room
  @SubscribeMessage('joinRoom')
  JoinRoom(@ConnectedSocket() client: Socket) {
    console.log('=================join================');

    const getRandomColor = this.createRandomColorGenerator();
    //store all rooms
    let checkRooms = this.server.sockets.adapter.rooms;
    let checkIfFreeRoomExists: boolean = false;
    //check if there is not created room yet
    for (let [room, ids] of checkRooms) {
      //if there is room
      console.log('ROOMS=', room);

      if (room.length === 6) {
        console.log('ROOM with length 6 =', room);
        if (ids.size === 1) {
          console.log('ids=', ids);
          checkIfFreeRoomExists = true;
          client.join(room);
          const userGeneratedData = { id: client.id, color: getRandomColor };
          //set user in Map
          this.roomsMap.get(room)?.push(userGeneratedData);
          console.log('GetsExistingRoomMap', this.roomsMap.get(room));

          this.server.to(room).emit('joinedRoom', {
            roomMembers: this.roomsMap.get(room),
            JoinedRoom: room,
          });

          // for (let [room, users] of this.roomsMap) {
          // if(users.length===1){
          //   this.roomsMap.get(room)?.push()
          // }
          // }
          break;
        } else {
          console.log('all ids=', ids);
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
        ?.push({ id: client.id, color: getRandomColor });
      this.server.to(randomRoomId).emit('joinedRoom', {
        roomMembers: this.roomsMap.get(randomRoomId),
        JoinedRoom: randomRoomId,
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
      clientId: client.id,
      leavedRoom: roomId,
    });
    client.emit('leavedRoom', {
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
          console.log('updatedUsers: ', updatedUsers);
          if (updatedUsers.length > 0) {
            this.roomsMap.set(room, updatedUsers);
          } else {
            this.roomsMap.delete(room);
          }
          this.server.to(room).emit('leavedRoom', {
            clientId: client.id,
            leavedRoom: room,
          });
        }
      });
    }
    console.log(this.roomsMap);
    console.log(`Client disconnected: ${client.id}`);
  }

  createRandomColorGenerator() {
    const userInterfaceColorsArray = [
      '#FF0000',
      '#00FF00',
      '#0000FF',
      '#FFFF00',
      '#FF00FF',
      '#00FFFF', // Basic colors
      '#FFB3BA',
      '#FFDFBA',
      '#FFFFBA',
      '#BAFFC9',
      '#BAE1FF', // Pastel colors
      '#1B1B1B',
      '#2C2C2C',
      '#3D3D3D',
      '#4E4E4E',
      '#5F5F5F', // Dark tones
      '#E63946',
      '#F4A261',
      '#2A9D8F',
      '#264653',
      '#8AB17D', // Vibrant colors
    ];
    const randomNumber = Math.floor(Math.random() * 21);
    const getRandomColor = userInterfaceColorsArray[randomNumber];
    return getRandomColor;
  }
}
