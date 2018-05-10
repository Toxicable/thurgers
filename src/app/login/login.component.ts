import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { AngularFireAuth, AngularFireAuthModule} from 'angularfire2/auth';
import { AngularFirestore, AngularFirestoreCollection } from 'angularfire2/firestore';
import { User } from './user';
import { Router } from '@angular/router';
import * as firebase from 'firebase/app';

@Component({

  selector: 'app-login',
  template: `
    <h1>Login</h1>
    <button (click)="login()" mat-raised-button color="primary" >Login</button>
    <div *ngIf="error">
      <p>You signed in with the wrong account. It must be one of ours. </p>
      <p>
        Visit here https://myaccount.google.com/permissions?pli=1
        to remove Thurgers if the popup dosen't give you a chance to pick another email need be
      </p>
    </div>
  `
})

export class LoginComponent {
  error: boolean;

  constructor(private readonly afAuth: AngularFireAuth, private readonly router: Router, private cdr: ChangeDetectorRef) {
  }

  login() {
    this.error = false;
    this.afAuth.auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .then(state => {
      const email = atob('QHJvY2tldGxhYi5jby5ueg==');
      if ((state.user.email as string).endsWith(email)) {
        this.router.navigateByUrl('/');
      } else {
        this.error = true;
        this.afAuth.auth.signOut();
        this.cdr.detectChanges();
      }
    });
  }
}
