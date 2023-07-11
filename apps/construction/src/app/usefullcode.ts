import { HttpClient } from '@angular/common/http';
import { signal, Signal, computed, inject } from '@angular/core';
import {
  toSignal,
  takeUntilDestroyed,
  toObservable,
} from '@angular/core/rxjs-interop';
import { of, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { UserInterface } from './models/user';

class Test {
  private usersSig = signal<UserInterface[]>([]);
  getUsers(): Signal<UserInterface[]> {
    return computed(this.usersSig);
  }

  addUser(user: UserInterface): void {
    this.usersSig.update((users) => [...users, user]);
  }

  removeUser(userId: string): void {
    // const updatedUsers = this.usersSig().filter((user) => user.id !== userId);
    // this.usersSig.set(updatedUsers);
  }
  add() {
    // this.data.update((data) => [...data, this.item()]);
  }
  remove(item: string) {
    // this.data.set(this.data().filter((dat) => dat != item));
  }
  //arr = toSignal(of(1, 2, 13).pipe(takeUntilDestroyed(this.sub)));
  http = inject(HttpClient);
  searchSig = signal<string>('');
  articles$ = toObservable(this.searchSig).pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((searchValue) =>
      this.http.get<any[]>(
        `http://localhost:3004/articles?title_like=${searchValue}`
      )
    )
  );
  articlesSig = toSignal(this.articles$);

  //  <input type="text" (keyup)="search($event)" />
  // <div *ngFor="let article of articlesSig()">
  //   {{ article.title }}
  // </div>
  search(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchSig.set(value);
  }
}
