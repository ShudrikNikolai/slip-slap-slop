import { AuthModule } from '@/modules/auth/auth.module';
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInvitation } from './entities/user-invitation';
import { User } from './entities/user.entity';
import { UserInvitationRepository } from './repositories/user-invitation.repository';
import { UserRepository } from './repositories/user.repository';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Global()
@Module({
    imports: [TypeOrmModule.forFeature([User, UserInvitation]), AuthModule],
    controllers: [UserController],
    providers: [UserRepository, UserInvitationRepository, UserService],
    exports: [UserService, UserRepository, UserInvitationRepository],
})
export class UserModule {}
