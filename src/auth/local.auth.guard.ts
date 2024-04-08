import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
//AuthGuard('local'): Это вызов конструктора базового класса AuthGuard с аргументом ‘local’. Это указывает, что будет использоваться локальная стратегия аутентификации.
export class LocalAuthGuard extends AuthGuard('local') {
  // async canActivate(context: ExecutionContext): Это асинхронный метод, который вызывается, когда требуется проверить, может ли пользователь получить доступ к определенному маршруту. ExecutionContext представляет собой объект, который содержит информацию о текущем запросе.
  async canActivate(context: ExecutionContext) {
    const result = (await super.canActivate(context)) as boolean;
    const request = context.switchToHttp().getRequest();

    //await super.logIn(request);: Это вызывает метод logIn базового класса AuthGuard, который устанавливает свойство user в объекте запроса после успешной аутентификации.
    await super.logIn(request);

    return result;
  }
}
