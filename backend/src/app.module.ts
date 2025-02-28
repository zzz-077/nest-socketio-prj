import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SocketGateway } from './socket.gateway';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [],
  providers: [SocketGateway],
})
export class AppModule {}
