import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { DbModule } from 'src/db/db.module';
import { LocalStrategy } from './local.strategy';
import { SessionSerializer } from './session.serializer';

@Module({
  imports: [PassportModule.register({ session: true }), DbModule],
  providers: [AuthService, LocalStrategy, SessionSerializer],
})
export class AuthModule {}
