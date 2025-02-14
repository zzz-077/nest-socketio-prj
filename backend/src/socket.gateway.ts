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
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: { origin: '*' } })
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;
  private UniqUsers = new Map<String, String>();
  //user uniq  join in map
  userJoined(client: Socket) {
    console.log(client.id);
    const userId = client.handshake;
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
    this.userJoined(client);
    console.log(`Client connected: ${client.id}`);
  }
  //disconnect clientSocket
  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }
}
