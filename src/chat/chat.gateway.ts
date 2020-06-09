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

@WebSocketGateway()
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server;
  users = 0;

  async handleConnection(): Promise<void> {
    // A client has connected
    this.users++;

    // Notify connected clients of current users
    this.server.emit('users', this.users);
  }

  async handleDisconnect(): Promise<void> {
    // A client has disconnected
    this.users--;

    // Notify connected clients of current users
    this.server.emit('users', this.users);
  }

  @SubscribeMessage('createRoom')
  async createRoom(
    @ConnectedSocket() socket: Socket,
    message: string,
  ): Promise<void> {
    socket.broadcast.emit('chat', message);
  }

  @SubscribeMessage('joinRoom')
  async joinRoom(@ConnectedSocket() socket: Socket, message): Promise<void> {
    socket.join('hello').emit('chat', 'Ssibal');
    console.log('어떤놈 들어왔따');
  }

  @SubscribeMessage('chat')
  async onChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: string,
  ): Promise<void> {
    socket.broadcast.emit('chat', message);
  }

  @SubscribeMessage('disconnect')
  async onClose(
    @ConnectedSocket() socket: Socket,
    @MessageBody() message: string,
  ): Promise<void> {
    socket.broadcast.emit('chat', '어떤놈 나갔다');
  }
}
