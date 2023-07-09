import { Injectable, Signal, computed, signal } from '@angular/core';
import { UserInterface } from '../models/user';
import { StoreInterface } from '../models/store';
import { UserApiResponseInterface } from '../../../../../libs/common/src/models/user-response';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  // private usersSig = signal<UserInterface[]>([]);
  // getUsers(): Signal<UserInterface[]> {
  //   return computed(this.usersSig);
  // }

  // addUser(user: UserInterface): void {
  //   this.usersSig.update((users) => [...users, user]);
  // }

  // removeUser(userId: string): void {
  //   const updatedUsers = this.usersSig().filter((user) => user.id !== userId);
  //   this.usersSig.set(updatedUsers);
  // }
  private stateSessionItem = 'state';
  private store = signal<StoreInterface>(this.initializeStore());

  constructor() {
    const stateObject: StoreInterface | undefined = JSON.parse(
      sessionStorage.getItem(this.stateSessionItem) as string
    );
    if (!!stateObject) {
      this.store.set(stateObject);
    } else this.saveStore();
  }
  isUserLoggedIn(): Signal<boolean | undefined> {
    return computed(() => this.store()?.user?.loggedIn);
  }
  isLoading(): Signal<boolean | undefined> {
    return computed(() => this.store()?.isLoading);
  }
  getJwtToken(): Signal<string | undefined> {
    return computed(() => this.store()?.user?.jwtToken);
  }
  loginError(): Signal<string | undefined> {
    return computed(() => this.store()?.user?.error);
  }

  getUser(): Signal<UserInterface> {
    return computed(() => this.store()?.user);
  }
  saveStore() {
    sessionStorage.setItem(this.stateSessionItem, JSON.stringify(this.store()));
  }
  updateIsLoading(flag: boolean) {
    this.store.update((state) => {
      return { ...state, isLoading: flag };
    });
    this.saveStore();
  }
  updateLoginError() {
    this.store.update((state) => {
      return { ...state, user: { ...state.user, error: '' } };
    });
    this.saveStore();
  }
  updateStateLogoutSuccessful() {
    const user: UserInterface = {
      loggedIn: false,
      userId: '',
      jwtToken: '',
      role: '',
      error: '',
      firstName: '',
      lastName: '',
    };
    this.store.update((state) => {
      return { ...state, user: user };
    });
    this.saveStore();
  }
  updateStateLoginSuccessful(response: UserApiResponseInterface) {
    const user: UserInterface = {
      loggedIn: true,
      userId: response?.userId,
      jwtToken: response?.jwtToken,
      role: response?.userId,
      error: '',
      firstName: response?.firstName,
      lastName: response?.lastName,
    };
    this.store.update((state) => {
      return { ...state, user: user };
    });
    this.saveStore();
  }
  updateStateLoginFailure(error: string) {
    const user: UserInterface = {
      loggedIn: false,
      userId: '',
      jwtToken: '',
      role: '',
      error: error,
      firstName: '',
      lastName: '',
    };
    this.store.update((state) => {
      return { ...state, user: user };
    });
    this.saveStore();
  }
  initializeStore(): StoreInterface {
    return {
      user: {
        loggedIn: false,
        userId: '',
        jwtToken: '',
        role: '',
        error: '',
        firstName: '',
        lastName: '',
      },
    };
  }
}
