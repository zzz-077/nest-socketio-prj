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
  private UniqUsers = new Set<String>();
  //user uniq  join in map
  userJoined(client: Socket) {
    //save user in set
    this.UniqUsers.add(client.id);
    // console.log(this.UniqUsers);
  }
  //join room
  @SubscribeMessage('joinRoom')
  JoinRoom(@ConnectedSocket() client: Socket) {
    console.log('=====================================');

    //store all rooms
    let checkRooms = this.server.sockets.adapter.rooms;
    // console.log('=========1==========');
    // console.log(checkRooms);

    let checkIfFreeRoomExists: boolean = false;
    //check if there is not created room yet
    for (let [room, ids] of checkRooms) {
      //if there is room
      if (room.length === 6) {
        if (ids.size === 1) {
          // console.log('=========2==========');
          // console.log('joined in already created room');
          checkIfFreeRoomExists = true;
          client.join(room);
          client.emit('joinedRoom', { JoinedRoom: room, clientId: client.id });
          break;
        }
      }
    }
    //if  all room are busy already we have to create new room
    if (!checkIfFreeRoomExists) {
      //generate random room id
      const randomRoomId = uid(6);
      // console.log('=========2==========');
      // console.log('joined in new created room');
      client.join(randomRoomId);
      client.emit('joinedRoom', {
        JoinedRoom: randomRoomId,
        clientId: client.id,
      });
    }

    console.log('=========4==========');
    console.log(checkRooms);
  }
  //leave room
  @SubscribeMessage('leaveRoom')
  leaveRoom(@ConnectedSocket() client: Socket, @Body() roomId: string) {
    console.log('=====================================');
    console.log(roomId);

    client.leave(roomId);
    client.emit('leavedRoom', { leavedRoom: roomId, clientId: client.id });
    let checkRooms = this.server.sockets.adapter.rooms;
    console.log(checkRooms);
  }
  //connect clientSocket
  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    this.userJoined(client);
  }
  //disconnect clientSocket
  handleDisconnect(client: Socket) {
    // this.UniqUsers.delete(client.id);
    // console.log('log1', this.UniqUsers);
    console.log(`Client disconnected: ${client.id}`);
  }
}
