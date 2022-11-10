import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { UserModule } from './user/user.module';

@Module({
  controllers: [AppController],
  imports: [
    UserModule,
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/mycompanydb'),
  ],
})
export class AppModule {}
