import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();

    //return request.isAuthenticated();: Это возврат значения, указывающего, аутентифицирован ли пользователь. isAuthenticated - это метод, предоставляемый пакетом express, который обычно устанавливается пакетом passport при успешной аутентификации. Если пользователь аутентифицирован, метод возвращает true, иначе false.
    return request.isAuthenticated();
  }
}
