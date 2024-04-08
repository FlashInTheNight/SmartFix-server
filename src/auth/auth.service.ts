import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DbService } from 'src/db/db.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private db: DbService) {}
  async validateUser(username: string, password: string) {
    const user = await this.db.user.findFirst({
      where: { username },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials username');
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials password');
    }

    if (user && passwordValid) {
      return {
        userId: user.id,
        username: user.username,
        email: user.email,
      };
    }

    return null;
  }
}
