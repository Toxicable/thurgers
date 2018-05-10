import { Component, OnInit } from '@angular/core';
import { first, map, shareReplay, take, concatMap, tap } from 'rxjs/operators';
import { combineLatest } from 'rxjs/observable/combineLatest';
import { AngularFirestore, AngularFirestoreCollection, DocumentChangeAction, AngularFirestoreDocument } from 'angularfire2/firestore';
import { Observable } from 'rxjs/Observable';
import { Thurger } from './thuger';
import { timer } from 'rxjs/observable/timer';
import { addDays, distanceInWordsToNow } from 'date-fns';
import { AngularFireAuth } from 'angularfire2/auth';
import { User } from '@firebase/auth-types';
import { of } from 'rxjs/observable/of';

export interface Settings {
  disable: boolean;
}

function snapshotChangesId<T>(items: DocumentChangeAction[]): any  {
  return items.map(a => {
    const data = a.payload.doc.data();
    const id = a.payload.doc.id;
    return { id, ...data };
  });
}

@Component({
  selector: 'app-orders',
  templateUrl: 'orders.component.html',
  styles: [`
    .side {
      display: inline-block;
      width: 250px;
    }
  `]
})
export class OrdersComponent implements OnInit {

  constructor(
    private afs: AngularFirestore,
    private afAuth: AngularFireAuth,
  ) { }

  settingsRef: AngularFirestoreDocument<Settings>;
  thurgersRef: AngularFirestoreCollection<Thurger>;

  timer$: Observable<Date>;
  user$: Observable<User>;

  thurgers$: Observable<Thurger[]>;
  thurgerTime$: Observable<string>;
  counts$: Observable<{ Chicken: number; Beef: number }>;
  thurgerIds$: Observable<Thurger[]>;
  settings: Settings;

  cutOffRl(email: string) {
    return email.replace(atob('QHJvY2tldGxhYi5jby5ueg=='), '');
  }

  ngOnInit() {
    this.thurgersRef = this.afs.collection<Thurger>('thurgers', ref => ref.orderBy('addedAt', 'desc'));
    this.settingsRef = this.afs.doc('settings/1');
    this.settingsRef.valueChanges().subscribe(s => this.settings = s);

    window['disableItYo'] = () => this.settingsRef.update({disable: true});

    this.user$ = this.afAuth.authState;
    this.timer$ = timer(0, 1000).pipe(map(i => new Date()), shareReplay());

    this.thurgerIds$ = this.thurgersRef.snapshotChanges()
      .map(thurgers => snapshotChangesId<Thurger>(thurgers))
      .map((thurgers: Thurger[]) => {
        return thurgers.map(t => {
          t.addedAt = distanceInWordsToNow(t.updatedAt);
          return t;
        });
      })
      .pipe(shareReplay());


    this.counts$ = this.thurgerIds$
      .map(thurgers => {
        const count = {
          Chicken: 0,
          Beef: 0,
          Other: []
        };
        thurgers.forEach(t => {
          if (t.extras) {
            count.Other.push(`${t.choice} + ${t.extras}`);
          } else {
            count[t.choice] += 1;
          }
        });
        count.Other.sort();
        return count;
      });

    this.thurgers$ = combineLatest(this.timer$, this.thurgerIds$, (time, thurgers) => thurgers).pipe(tap(a => console.log));

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

  canEdit(orderId: string, uid: string) {
    return orderId === uid;
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

  trackById(idx: number, item: any) {
    return item['id'];
  }

  update(id: string, choice: 'Chicken' | 'Beef', extras: string, canEdit: boolean) {
    if (!canEdit || this.settings.disable) {
      return;
    }
    this.thurgersRef.doc(id).update({
      choice,
      extras,
      updatedAt: new Date().toISOString(),
    });
  }

  add(userId: string, email: string) {
    if (this.settings.disable) {
      return;
    }
    this.afs.collection<Thurger>('thurgers').valueChanges().pipe(take(1), tap(thurgers => {
      const existing = thurgers.find(t => t.email === email);
      if (!existing) {
        this.thurgersRef.add({
          email,
          userId,
          choice: null,
          extras: null,
          addedAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    })).subscribe();
  }

  remove(id: string) {
    if (this.settings.disable) {
      return;
    }
    return this.thurgersRef.doc(id).delete();
  }
}
