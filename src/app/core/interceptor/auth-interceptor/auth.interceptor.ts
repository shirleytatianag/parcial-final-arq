import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest,} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AlertService} from "@app/core/services/alert.service";
import {StorageService} from "@app/core/services/storage.service";
import {AuthService} from "@app/modules/auth/services/auth.service";
import {Router} from "@angular/router";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private _storage: StorageService,
    private _auth: AuthService,
    private _alertService: AlertService,
    private _router: Router,
  ) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const access_token = this._storage.getItem<string>('access_token');

    if (request.url === 'https://api.escuelajs.co/api/v1/auth/login') {
      return next.handle(request);
    }

    if (access_token) {
      request = AuthInterceptor.addTokenHeader(request, access_token);
    } else {
      this._auth.logout();
      this._alertService.warning('Tiempo expirado, vuelve a iniciar sesión');
      this._router.navigateByUrl('/').then(
        () => {
          location.reload();
        }
      );
    }
    return next.handle(request);
  }

  private static addTokenHeader(request: HttpRequest<any>, token: string) {
    return request.clone({setHeaders: {Authorization: `Bearer ${token}`}});
  }
}
