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
  getUserNewMessagesNbr(): Signal<number | undefined> {
    return computed(() => this.store()?.general?.newMessagesNbr);
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
  getRefreshToken(): Signal<string | undefined> {
    return computed(() => this.store()?.user?.refreshToken);
  }
  getUserName(): Signal<string | undefined> {
    return computed(
      () => this.store()?.user?.firstName + ' ' + this.store()?.user?.lastName
    );
  }
  getUserfirstName(): Signal<string | undefined> {
    return computed(() => this.store()?.user?.firstName);
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
  getPlan(): Signal<any> {
    return computed(() => this.store()?.plan);
  }
  saveStore() {
    sessionStorage.setItem(this.stateSessionItem, JSON.stringify(this.store()));
  }
  updateUserNewMessagesNbr(nbr: number) {
    this.store.update((state) => {
      return { ...state, general: { ...state.general, newMessagesNbr: nbr } };
    });
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
  updateJwtToken(token: string) {
    this.store.update((state) => {
      return { ...state, user: { ...state.user, jwtToken: token } };
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
      refreshToken: '',
      role: '',
      error: '',
      firstName: '',
      lastName: '',
      company: '',
      jobProfileDescription: '',
      website: '',
      profileImage: undefined,
      logoImage: undefined,
      middleName: '',
      registeredDate: null,
      active: false,
      registered: false,
      lastLoginDate: null,
    };
    this.store.update((state) => {
      return {
        ...state,
        user: user,
        general: { ...state.general, newMessagesNbr: null },
      };
    });
  }
  updateStateLoginSuccessful(response: UserApiResponseInterface) {
    const user: UserInterface = {
      loggedIn: true,
      userId: response?.user?.userId,
      profileImage: response?.user?.profileImage,
      logoImage: response?.user?.logoImage,
      jwtToken: response?.user?.jwtToken,
      refreshToken: response?.user?.refreshToken,

      role: response?.user?.role,
      phone: response?.user?.phone,
      fax: response?.user?.fax,
      address: response?.user?.address,
      city: response?.user?.city,
      website: response?.user?.website,
      jobProfileDescription: response?.user?.jobProfileDescription,
      company: response?.user?.company,
      province: response?.user?.province,
      postalCode: response?.user?.postalCode,
      error: '',
      firstName: response?.user?.firstName,
      lastName: response?.user?.lastName,
      middleName: response?.user?.middleName,
      registeredDate: response?.user?.registeredDate,
      active: response?.user?.active,
      registered: response?.user?.registered,
      lastLoginDate: response?.user?.lastLoginDate,
    };

    this.store.update((state) => {
      return {
        ...state,
        user: user,
        plan: response?.plan,
        general: { ...state.general, newMessagesNbr: response?.newMessagesNbr },
      };
    });
  }
  updateStateProfileSuccessful(response: UserApiResponseInterface) {
    this.store.update((state) => {
      return {
        ...state,
        user: {
          ...state.user,
          profileImage: response?.user?.profileImage,
          logoImage: response?.user?.logoImage,
          firstName: response?.user?.firstName,
          lastName: response?.user?.lastName,
          middleName: response?.user?.middleName,
          website: response?.user?.website,
          jobProfileDescription: response?.user?.jobProfileDescription,
          company: response?.user?.company,
          phone: response?.user?.phone,
          fax: response?.user?.fax,
          address: response?.user?.address,
          city: response?.user?.city,
          province: response?.user?.province,
          postalCode: response?.user?.postalCode,
        },
      };
    });
  }
  updatePlan(plan: any) {
    this.store.update((state) => {
      return {
        ...state,
        plan: plan,
      };
    });
  }
  updateStateLoginFailure(error: string) {
    const user: UserInterface = {
      loggedIn: false,
      userId: '',
      jwtToken: '',
      refreshToken: '',
      role: '',
      error: error,
      firstName: '',
      lastName: '',
      website: '',
      middleName: '',
      jobProfileDescription: '',
      company: '',
      registeredDate: null,
      active: false,
      registered: false,
      lastLoginDate: null,
    };
    this.store.update((state) => {
      return {
        ...state,
        user: user,
        general: { ...state.general, newMessagesNbr: null },
      };
    });
  }
  initializeStore(): StoreInterface {
    return {
      general: { theme: 'dark' },
      plan: null,
      user: {
        loggedIn: false,
        userId: '',
        jwtToken: '',
        refreshToken: '',
        role: '',
        error: '',
        firstName: '',
        lastName: '',
        website: '',
        jobProfileDescription: '',
        profileImage: undefined,
        logoImage: undefined,
        company: '',
        middleName: '',
        registeredDate: null,
        active: false,
        registered: false,
        lastLoginDate: null,
      },
    };
  }
}
