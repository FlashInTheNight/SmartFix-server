import { Injectable } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  // serializeUser: Этот метод используется для сериализации пользователя в сессию. Когда пользователь аутентифицируется, информация о пользователе сохраняется в сессии. Метод serializeUser определяет, какая информация о пользователе будет сохранена в сессии. В данном случае, вся информация о пользователе сохраняется в сессии.
  serializeUser(user: any, done: (err: Error, user: any) => void) {
    done(null, user);
  }

  // deserializeUser: Этот метод используется для десериализации пользователя из сессии. Когда пользователь делает запрос, информация о пользователе извлекается из сессии. Метод deserializeUser определяет, как эта информация извлекается. В данном случае, вся информация о пользователе извлекается из сессии.
  deserializeUser(payload: any, done: (err: Error, user: any) => void) {
    done(null, payload);
  }
}
