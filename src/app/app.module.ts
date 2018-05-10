import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonModule, MatSelectModule, MatInputModule, MatCheckboxModule } from '@angular/material';
import { AngularFirestoreModule } from 'angularfire2/firestore';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { AngularFireModule } from 'angularfire2';
import { LoginComponent } from './login/login.component';
import { OrdersComponent } from './orders/orders.component';
import { RouterModule } from '@angular/router';
import { AuthGuardService } from './login/auth.guard';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    OrdersComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatSelectModule,
    MatInputModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    AngularFirestoreModule,
    AngularFireAuthModule,
    AngularFireModule.initializeApp({
      apiKey: 'AIzaSyCz1r2UaADi_Xel0-QOpMyLy0gvFWjCbQg',
      authDomain: 'thurgers.firebaseapp.com',
      databaseURL: 'https://thurgers.firebaseio.com',
      projectId: 'thurgers',
      storageBucket: 'thurgers.appspot.com',
      messagingSenderId: '1016886607087'
    }),
    RouterModule.forRoot([
      {path: '', component: OrdersComponent, canActivate: [AuthGuardService]},
      {path: 'login', component: LoginComponent},
    ])
  ],
  providers: [AuthGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }
