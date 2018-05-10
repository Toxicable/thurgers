import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AngularFireAuth } from 'angularfire2/auth';
import { map, take, tap, concatMap } from 'rxjs/operators';

@Injectable()
export class AuthGuardService implements CanActivate  {

  constructor(private readonly router: Router, private readonly afsAuth: AngularFireAuth) { }

  canActivate(): Observable<boolean> {
    return this.afsAuth.authState.pipe(
      take(1),
      map(authState => Boolean(authState)), map(authed => {
      if (authed) {
        return true;
      } else {
        this.router.navigate(['/login']);
        return false;
      }
    }));
  }
}
