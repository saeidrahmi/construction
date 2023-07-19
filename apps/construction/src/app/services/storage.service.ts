import { Injectable, Signal, computed, effect, signal } from '@angular/core';
import { UserInterface } from '../models/user';
import { StoreInterface } from '../models/store';
import { UserApiResponseInterface } from '../../../../../libs/common/src/models/user-response';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private stateSessionItem = 'state';
  private store = signal<StoreInterface>(this.initializeStore());
  constructor() {
    const stateObject: StoreInterface | undefined = JSON.parse(
      sessionStorage.getItem(this.stateSessionItem) as string
    );
    if (!!stateObject) {
      this.store.set(stateObject);
    }
    effect(() => {
      this.saveStore();
    });
  }
  getTheme(): Signal<string | undefined> {
    return computed(() => this.store()?.general?.theme);
    // try {
    //   return computed(() => this.store()?.general?.theme);
    // } catch (e) {
    //   this.errorMessage = typeof e === 'string' ? e : 'Error';
    //   return null;
    // }
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
  getUserName(): Signal<string | undefined> {
    return computed(
      () => this.store()?.user?.firstName + ' ' + this.store()?.user?.lastName
    );
  }
  loginError(): Signal<string | undefined> {
    return computed(() => this.store()?.user?.error);
  }

  getUser(): Signal<UserInterface> {
    return computed(() => this.store()?.user);
  }
  getUserId(): Signal<string> {
    return computed(() => this.store()?.user?.userId as string);
  }
  saveStore() {
    sessionStorage.setItem(this.stateSessionItem, JSON.stringify(this.store()));
  }
  updateIsLoading(flag: boolean) {
    this.store.update((state) => {
      return { ...state, isLoading: flag };
    });
  }
  updateLoginError() {
    this.store.update((state) => {
      return { ...state, user: { ...state.user, error: '' } };
    });
  }
  updateTheme(theme: string) {
    this.store.update((state) => {
      return { ...state, general: { ...state.general, theme: theme } };
    });
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
      registeredDate: null,
      active: false,
      registered: false,
      lastLoginDate: null,
    };
    this.store.update((state) => {
      return { ...state, user: user };
    });
  }
  updateStateLoginSuccessful(response: UserApiResponseInterface) {
    const user: UserInterface = {
      loggedIn: true,
      userId: response?.userId,
      jwtToken: response?.jwtToken,
      role: response?.role,
      phone: response?.phone,
      fax: response?.fax,
      address: response?.address,
      city: response?.city,
      province: response?.province,
      postalCode: response?.postalCode,
      error: '',
      firstName: response?.firstName,
      lastName: response?.lastName,
      registeredDate: response?.registeredDate,
      active: response?.active,
      registered: response?.registered,
      lastLoginDate: response?.lastLoginDate,
    };
    this.store.update((state) => {
      return { ...state, user: user };
    });
  }
  updateStateProfileSuccessful(response: UserApiResponseInterface) {
    console.log(response, 'respone');
    this.store.update((state) => {
      return {
        ...state,
        user: {
          ...state.user,
          firstName: response?.firstName,
          lastName: response?.lastName,
          phone: response?.phone,
          fax: response?.fax,
          address: response?.address,
          city: response?.city,
          province: response?.province,
          postalCode: response?.postalCode,
        },
      };
    });
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
      registeredDate: null,
      active: false,
      registered: false,
      lastLoginDate: null,
    };
    this.store.update((state) => {
      return { ...state, user: user };
    });
  }
  initializeStore(): StoreInterface {
    return {
      general: { theme: 'dark' },
      user: {
        loggedIn: false,
        userId: '',
        jwtToken: '',
        role: '',
        error: '',
        firstName: '',
        lastName: '',
        registeredDate: null,
        active: false,
        registered: false,
        lastLoginDate: null,
      },
    };
  }
}
