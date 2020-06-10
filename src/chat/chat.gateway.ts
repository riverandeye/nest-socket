import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import Message from '../model/message';

@WebSocketGateway(4000, { path: '/api/socket.io' })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server;
  users = 0;

  async handleConnection(): Promise<void> {
    // A client has connected
    this.users++;

    // Notify connected clients of current users
    this.server.emit('enter', this.users);
  }

  async handleDisconnect(): Promise<void> {
    // A client has disconnected
    this.users--;

    // Notify connected clients of current users
    this.server.emit('leave', this.users);
  }

  @SubscribeMessage('message')
  async onChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: string,
  ): Promise<void> {
    console.log(socket);
    const messageForm: Message = JSON.parse(message);

    if (!messageForm.room || !messageForm.name || !messageForm.message) {
      return;
    }

    console.log(messageForm.message);
    socket.join(messageForm.room).broadcast.emit('chat', message);
  }
}
