import { Component, OnInit } from '@angular/core';
import { first, map, shareReplay, take, concatMap, tap } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction, AngularFirestoreDocument } from 'angularfire2/firestore';
import { addDays, distanceInWordsToNow } from 'date-fns';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from '@firebase/auth-types';
import { FormControl } from '@angular/forms';
import { Subject, from, Observable, timer, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export interface Settings {
  disable: boolean;
}

interface MenuItem {
  name: string;
}

interface Order {
  uid: string;
  itemName: string;
  email: string;
  updatedAt: string;
  extras: string;
}

@Component({
  selector: 'app-orders',
  templateUrl: 'orders.component.html',
  styles: [`
    .flex {
      text-align: center;
      justify-content: center;
      display: grid;
      grid-template-columns: 300px 300px 300px;
    }
  `]
})
export class OrdersComponent implements OnInit {

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
  ) { }

  settingsRef: AngularFirestoreDocument<Settings>;
  ordersRef: AngularFirestoreCollection<Order>;
  order$: Observable<Order>;
  orders$: Observable<Order[]>;
  orderRef$: Observable<AngularFirestoreDocument<Order>>;
  orderGroups$: Observable<{[key: string]: Order[]}>

  timer$: Observable<Date>;
  user$: Observable<firebase.User>;

  thurgerTime$: Observable<string>;
  settings: Settings;

  selectedItem = new Subject();

  menu: MenuItem[] = [
    {name: 'Beef 🍔'},
    {name: 'Chicken 🍔'},
    {name: 'Veggie 🍔'},
  ]
  veggieControl = new FormControl(false);

  cutOffRl(email: string) {
    return email.replace(atob('QHJvY2tldGxhYi5jby5ueg=='), '');
  }

  ngOnInit() {
    this.ordersRef = this.afs.collection<Order>('orders', ref => ref.orderBy('updatedAt', 'desc'));
    this.settingsRef = this.afs.doc('settings/1');
    this.settingsRef.valueChanges().subscribe(s => this.settings = s);
    this.user$ = this.afAuth.authState.pipe(shareReplay());
    this.timer$ = timer(0, 1000).pipe(map(i => new Date()), shareReplay());

    this.orderRef$ =  this.user$.pipe(map(user => this.ordersRef.doc<Order>(user.uid)));

    this.order$ = this.user$.pipe(
      switchMap(user => {
        return this.orderRef$.pipe(switchMap(ref =>
          from(ref.set({
            uid: user.uid, 
            email: user.email,
            updatedAt: new Date().toISOString()
          } as any, {merge: true}))
          .pipe(
            concatMap(() => ref.valueChanges()),
          )))
      })
    );

    this.orders$ = combineLatest(
      this.timer$, 
      this.ordersRef.valueChanges()
    ).pipe(map(([timer, orders]) => {
      return orders.filter(order => Boolean(order.itemName))
        .map(t => {
          return {
            ...t,
            updatedAt: distanceInWordsToNow(t.updatedAt)
          }
        });
    }))
      
    window['disableItYo'] = () => this.settingsRef.update({disable: true});
    
    this.orderGroups$ = this.orders$.pipe(map(orders => {
      const grouped: {[key: string]: Order[]} = {
        special: []
      };

      orders.forEach(order => {
        if(order.extras) {
          grouped['special'].push(order)
        } else if(grouped[order.itemName]){
          grouped[order.itemName].push(order)
        }else {
          grouped[order.itemName] = [order];
        }
      });

      grouped['special'] = grouped['special'].sort();

      return grouped;
    }));
        
    const thursday = 4;

    this.thurgerTime$ = this.timer$.pipe(
      map(i => {
        let target = new Date();
        target.setHours(11, 45, 0, 0);
        const day = target.getDay();

        if (day > thursday) {
          target = addDays(target, 7 + (thursday - day));
        } else if (day < thursday) {
          target = addDays(target, thursday - day);
        } else {
          if (new Date().getHours() > 12) {
            target = addDays(target, 7);
          }
        }

        const duration = this.getTimeRemaining(target);
        return `${duration.days}d ${duration.hours}h ${duration.minutes}m ${duration.seconds}s`;
      })
    );
  }

  getGroups(groups: {}) {
    return Object.keys(groups).sort();
  }

  updateOrder(item: MenuItem | null) {
    this.orderRef$.pipe(
      concatMap(ref => ref.update({
        itemName: item ? item.name : '',
        updatedAt: new Date().toISOString(),
      }))
    ).subscribe();
  }

  updateExtras(extras = '') {
    this.orderRef$.pipe(
      concatMap(ref => ref.update({
        updatedAt: new Date().toISOString(),
        extras
      }))
    ).subscribe();
  }

  trackById(idx: number, item: Order) {
    return item.uid;
  }

  getTimeRemaining(endtime: Date) {
    const t = endtime.getTime() - new Date().getTime();
    const seconds = Math.floor((t / 1000) % 60);
    const minutes = Math.floor((t / 1000 / 60) % 60);
    const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
    const days = Math.floor(t / (1000 * 60 * 60 * 24));
    return {
      'days': days,
      'hours': hours,
      'minutes': minutes,
      'seconds': seconds
    };
  }
}
