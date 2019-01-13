
import {tap} from 'rxjs/operators';
import { Injectable, Injector } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';



@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private auth: AuthService;

  constructor(private injector: Injector, private router: Router) {
  }

  public intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.url.includes('localhost')) {
      if (!req.headers.has('Content-Type')) {
        req = req.clone({
          headers: req.headers.set('Content-Type', 'application/json')
        });
      } else if (req.headers.get('Content-Type') === 'multipart/form-data') {
        req = req.clone({
          headers: req.headers.delete('Content-Type')
        });
      }
      if (!this.auth) {
        this.auth = this.injector.get(AuthService);
      }
      const token = this.auth.getToken();
      if (token) {
        req = req.clone({headers: req.headers.set('Authorization', 'Bearer ' + token)});
      }
    } else {
      req = req.clone({
        headers: req.headers.delete('Authorization').delete('Content-Type')
      });
    }

    return next.handle(req).pipe(tap((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        // do stuff with response if you want
      }
    }, (err: any) => {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401 ||
          err.status === 403) {
          // redirect to the login route
          // or show a modal
          this.auth.logout();
          this.router.navigateByUrl(`/login`);
        }
      } else {
        console.error(err)
      }
    }));
  }
}
