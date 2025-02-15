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
@WebSocketGateway({ cors: { origin: '*' } })
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

  @SubscribeMessage('joinRoom')
  JoinRoom(@ConnectedSocket() client: Socket) {
    console.log('=====================================');

    //store all rooms
    let checkRoom = this.server.sockets.adapter.rooms;
    console.log('=========1==========');
    console.log(checkRoom);

    //generate random room id
    let checkIfFreeRoomExists: boolean = false;
    //check if there is not created room yet
    for (let [room, ids] of checkRoom) {
      //if there is room
      if (room.length === 6) {
        if (ids.size === 1) {
          console.log('=========2==========');
          console.log('joined in already created room');
          checkIfFreeRoomExists = true;
          client.join(room);
          client.emit('joinedRoom', `Joined room: ${room}`);
          break;
        }
      }
    }
    //if  all room are busy already we have to create new room
    if (!checkIfFreeRoomExists) {
      const randomRoomId = uid(6);
      console.log('=========2==========');
      console.log('joined in new created room');
      client.join(randomRoomId);
      client.emit('joinedRoom', `Joined room: ${randomRoomId}`);
    }

    console.log('=========4==========');
    console.log(checkRoom);
  }
  //sendmessage
  @SubscribeMessage('send_message')
  sendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() message: string,
  ) {
    if (!client) {
      console.error('Client socket is not defined');
      return;
    }
    // Broadcast the message to all clients except the sender
    client.broadcast.emit('receive_message', message);
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
