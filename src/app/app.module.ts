import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { AngularFireModule } from '@angular/fire';
import { RouterModule } from '@angular/router';
import { AuthGuardService } from './login/auth.guard';
import { LoginComponent } from './login/login.component';
import { OrdersComponent } from './orders/orders.component';
import { ReactiveFormsModule } from '@angular/forms';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
    RouterModule.forRoot([
      {path: '', component: OrdersComponent, canActivate: [AuthGuardService]},
      {path: 'login', component: LoginComponent},
    ]),
    AngularFireModule.initializeApp({
      apiKey: 'AIzaSyCz1r2UaADi_Xel0-QOpMyLy0gvFWjCbQg',
      authDomain: 'thurgers.firebaseapp.com',
      databaseURL: 'https://thurgers.firebaseio.com',
      projectId: 'thurgers',
      storageBucket: 'thurgers.appspot.com',
      messagingSenderId: '1016886607087'
    }),
  ],
  providers: [AuthGuardService],
  bootstrap: [AppComponent]
})
export class AppModule { }

