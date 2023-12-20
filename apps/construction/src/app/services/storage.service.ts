import { Injectable, Signal, computed, effect, signal } from '@angular/core';
import { UserInterface } from '../models/user';
import { StoreInterface } from '../models/store';
import { UserApiResponseInterface } from '../../../../../libs/common/src/models/user-response';
import { AdvertisementInterface } from '../models/advertisement';
import { UserPermissionsInterface } from '../models/user-permissions';

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
  getExpirationPeriodInDays(): Signal<number | undefined> {
    return computed(() => this.store()?.general?.expirationPeriodInDays);
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
  getSelectedAdvertisementId(): Signal<string | undefined> {
    return computed(() => this.store()?.advertisement?.advertisementIdSelected);
  }
  getSelectedRfpId(): Signal<string | undefined> {
    return computed(() => this.store()?.rfp?.rfpIdSelected);
  }
  getSelectedAdvertisement(): Signal<AdvertisementInterface | undefined> {
    return computed(() => this.store()?.advertisement?.advertisementSelected);
  }
  getSelectedRfp(): Signal<AdvertisementInterface | undefined> {
    return computed(() => this.store()?.rfp?.rfpSelected);
  }
  getAdvertisement(): Signal<any | undefined> {
    return computed(() => this.store()?.advertisement);
  }
  getRfp(): Signal<any | undefined> {
    return computed(() => this.store()?.rfp);
  }
  getUserName(): Signal<string | undefined> {
    return computed(
      () => this.store()?.user?.firstName + ' ' + this.store()?.user?.lastName
    );
  }

  getUserfirstName(): Signal<string | undefined> {
    return computed(() => this.store()?.user?.firstName);
  }
  getUserPasswordResetRequired(): Signal<boolean | undefined> {
    return computed(() => this.store()?.user?.passwordResetRequired);
  }
  getUserPermissions(): Signal<UserPermissionsInterface | undefined> {
    return computed(() => this.store()?.user?.userPermissions);
  }
  getUserRole(): Signal<string | undefined> {
    return computed(() => this.store()?.user?.role);
  }
  getUserIdEdited(): Signal<string | undefined> {
    return computed(() => this.store()?.userIdEdited);
  }
  getAdvertisementSearchFilters(): Signal<string[] | undefined> {
    return computed(() => this.store()?.advertisementSearchFilters);
  }
  getRfpSearchFilters(): Signal<string[] | undefined> {
    return computed(() => this.store()?.rfpSearchFilters);
  }
  getUserSelected(): Signal<any | undefined> {
    return computed(() => this.store()?.userSelected);
  }
  getSearchPreviousPage(): Signal<any | undefined> {
    return computed(() => this.store()?.searchPreviousPage);
  }
  getMapSearchSelectedCities(): Signal<string[] | undefined> {
    return computed(() => this.store()?.mapSearchSelectedCities);
  }
  getUserIdSelected(): Signal<string | undefined> {
    return computed(() => this.store()?.userIdSelected);
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
  updateSelectedAdvertisementId(id: string) {
    this.store.update((state) => {
      return {
        ...state,
        advertisement: { ...state.advertisement, advertisementIdSelected: id },
      };
    });
  }
  updateSelectedRfpId(id: string) {
    this.store.update((state) => {
      return {
        ...state,
        rfp: { ...state.rfp, rfpIdSelected: id },
      };
    });
  }
  clearAdvertisementSearchFilters() {
    this.store.update((state) => {
      return {
        ...state,
        advertisementSearchFilters: [],
      };
    });
  }
  updateAdvertisementSearchFilters(filterStr: string, province: string) {
    this.store.update((state) => {
      // Ensure that state.advertisementSearchFilters is an array or initialize it as an empty array
      const existingFilters = Array.isArray(state.advertisementSearchFilters)
        ? state.advertisementSearchFilters
        : [];
      let updatedFilters = [];
      if (filterStr?.toLowerCase()?.includes('rating'))
        updatedFilters = existingFilters.filter(
          (filter) => !filter?.toLowerCase()?.includes('rating')
        );
      else if (filterStr?.toLowerCase()?.includes('province'))
        updatedFilters = existingFilters.filter(
          (filter) =>
            !filter
              ?.toLowerCase()
              ?.includes('location (' + province?.toLowerCase())
        );
      else if (filterStr?.toLowerCase()?.includes('category'))
        updatedFilters = existingFilters.filter(
          (filter) => filter !== filterStr
        );
      else if (filterStr?.toLowerCase()?.includes('location'))
        updatedFilters = existingFilters.filter(
          (filter) =>
            !filter
              ?.toLowerCase()
              ?.includes('province (' + province?.toLowerCase()) &&
            filter !== filterStr
        );

      return {
        ...state,
        advertisementSearchFilters: [...updatedFilters, filterStr],
      };
    });
  }
  updateRfpSearchFilters(filterStr: string, province: string) {
    this.store.update((state) => {
      // Ensure that state.advertisementSearchFilters is an array or initialize it as an empty array
      const existingFilters = Array.isArray(state.rfpSearchFilters)
        ? state.rfpSearchFilters
        : [];
      let updatedFilters = [];
      if (filterStr?.toLowerCase()?.includes('rating'))
        updatedFilters = existingFilters.filter(
          (filter) => !filter?.toLowerCase()?.includes('rating')
        );
      else if (filterStr?.toLowerCase()?.includes('province'))
        updatedFilters = existingFilters.filter(
          (filter) =>
            !filter
              ?.toLowerCase()
              ?.includes('location (' + province?.toLowerCase())
        );
      else if (filterStr?.toLowerCase()?.includes('category'))
        updatedFilters = existingFilters.filter(
          (filter) => filter !== filterStr
        );
      else if (filterStr?.toLowerCase()?.includes('location'))
        updatedFilters = existingFilters.filter(
          (filter) =>
            !filter
              ?.toLowerCase()
              ?.includes('province (' + province?.toLowerCase()) &&
            filter !== filterStr
        );

      return {
        ...state,
        rfpSearchFilters: [...updatedFilters, filterStr],
      };
    });
  }
  removeAdvertisementSearchFilters(filterToRemove: string) {
    this.store.update((state) => {
      // Ensure that state.advertisementSearchFilters is an array or initialize it as an empty array
      const existingFilters = Array.isArray(state.advertisementSearchFilters)
        ? state.advertisementSearchFilters
        : [];

      // Create a new array without the filter to remove
      const updatedFilters = existingFilters.filter(
        (filter) => filter !== filterToRemove
      );

      return {
        ...state,
        advertisementSearchFilters: updatedFilters,
      };
    });
  }
  removeRfpSearchFilters(filterToRemove: string) {
    this.store.update((state) => {
      // Ensure that state.advertisementSearchFilters is an array or initialize it as an empty array
      const existingFilters = Array.isArray(state.rfpSearchFilters)
        ? state.rfpSearchFilters
        : [];

      // Create a new array without the filter to remove
      const updatedFilters = existingFilters.filter(
        (filter) => filter !== filterToRemove
      );

      return {
        ...state,
        rfpSearchFilters: updatedFilters,
      };
    });
  }

  clearAdvertisementInfo() {
    this.store.update((state) => {
      return {
        ...state,
        advertisement: null,
      };
    });
  }
  updateAdvertisementState(advertisement: any, id: string, action: any) {
    this.store.update((state) => {
      return {
        ...state,
        advertisement: {
          ...state.advertisement,
          advertisementIdSelected: id,
          advertisementSelected: advertisement,
          advertisementAction: action,
        },
      };
    });
  }
  updateRfpState(advertisement: any, id: string, action: any) {
    this.store.update((state) => {
      return {
        ...state,
        rfp: {
          ...state.rfp,
          rfpIdSelected: id,
          rfpSelected: advertisement,
          rfpAction: action,
        },
      };
    });
  }
  updateAdvertisementIdAndAction(id: string, action: any) {
    this.store.update((state) => {
      return {
        ...state,
        advertisement: {
          ...state.advertisement,
          advertisementIdSelected: id,

          advertisementAction: action,
        },
      };
    });
  }
  updateSelectedAdvertisement(
    advertisement: AdvertisementInterface,
    action: string
  ) {
    this.store.update((state) => {
      return {
        ...state,
        advertisement: {
          ...state.advertisement,
          advertisementSelected: advertisement,
          advertisementAction: action,
        },
      };
    });
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
  updateUserIdEdited(userId: any) {
    this.store.update((state) => {
      return { ...state, userIdEdited: userId };
    });
  }
  updateMapSearchSelectedCities(cities: string[]) {
    this.store.update((state) => {
      return { ...state, mapSearchSelectedCities: cities };
    });
  }
  clearMapSearchSelectedCities() {
    this.store.update((state) => {
      return { ...state, mapSearchSelectedCities: [] };
    });
  }
  updateUserSelected(user: any) {
    this.store.update((state) => {
      return { ...state, userSelected: user };
    });
  }
  setSearchPreviousPage(page: any) {
    this.store.update((state) => {
      return { ...state, searchPreviousPage: page };
    });
  }
  updateUserIdSelected(userId: string) {
    this.store.update((state) => {
      return { ...state, userIdSelected: userId };
    });
  }
  updateLoginError() {
    this.store.update((state) => {
      return { ...state, user: { ...state.user, error: '' } };
    });
  }
  updateUserLastPasswordResetDate(date: Date) {
    this.store.update((state) => {
      return { ...state, user: { ...state.user, lastPasswordResetDate: date } };
    });
  }
  removeUserProfileImage() {
    this.store.update((state) => {
      return { ...state, user: { ...state.user, profileImage: null } };
    });
  }
  updateLoginFlag(flag: boolean) {
    this.store.update((state) => {
      return { ...state, user: { ...state.user, loggedIn: flag } };
    });
  }
  updatePasswordResetRequiredFlag(flag: boolean) {
    this.store.update((state) => {
      return { ...state, user: { ...state.user, passwordResetRequired: flag } };
    });
  }
  updatePasswordResetDateFlag(date: Date) {
    this.store.update((state) => {
      return { ...state, user: { ...state.user, lastPasswordResetDate: date } };
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
      locked: false,
      registered: false,
      lastLoginDate: null,
      passwordResetRequired: null,
      lastPasswordResetDate: null,
    };
    this.store.update((state) => {
      return {
        ...state,
        user: user,
        advertisement: null,
        rfp: null,
        userIdSelected: null,
        plan: null,
        general: {
          ...state.general,
          newMessagesNbr: null,
          expirationPeriodInDays: null,
        },
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
      phone: response?.user?.phone ? response?.user?.phone : '',
      fax: response?.user?.fax ? response?.user?.fax : '',
      address: response?.user?.address ? response?.user?.address : '',
      city: response?.user?.city ? response?.user?.city : '',
      website: response?.user?.website ? response?.user?.website : '',
      jobProfileDescription: response?.user?.jobProfileDescription
        ? response?.user?.website
        : '',
      company: response?.user?.company ? response?.user?.company : '',
      province: response?.user?.province,
      postalCode: response?.user?.postalCode ? response?.user?.postalCode : '',
      error: '',
      firstName: response?.user?.firstName ? response?.user?.firstName : '',
      lastName: response?.user?.lastName ? response?.user?.lastName : '',
      middleName: response?.user?.middleName ? response?.user?.middleName : '',
      registeredDate: response?.user?.registeredDate,
      active: response?.user?.active,
      locked: response?.user?.locked,
      registered: response?.user?.registered,
      lastLoginDate: response?.user?.lastLoginDate,
      userPermissions: response?.userPermissions,
      passwordResetRequired: response?.user?.passwordResetRequired,
      lastPasswordResetDate: response?.user?.lastPasswordResetDate,
    };

    this.store.update((state) => {
      return {
        ...state,
        user: user,
        plan: response?.plan,
        general: {
          ...state.general,
          newMessagesNbr: response?.newMessagesNbr,
          expirationPeriodInDays: response?.expirationPeriodInDays,
        },
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
      locked: false,
      registered: false,
      lastLoginDate: null,
      userPermissions: null,
      passwordResetRequired: null,
      lastPasswordResetDate: null,
    };
    this.store.update((state) => {
      return {
        ...state,
        user: user,
        plan: null,
        general: { ...state.general, newMessagesNbr: null },
      };
    });
  }
  initializeStore(): StoreInterface {
    return {
      general: { theme: 'light' },
      plan: null,
      advertisement: null,
      searchPreviousPage: null,
      rfp: null,
      mapSearchSelectedCities: [],
      advertisementSearchFilters: [],
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
        locked: false,
        registered: false,
        lastLoginDate: null,
        userPermissions: null,
        passwordResetRequired: null,
        lastPasswordResetDate: null,
      },
    };
  }
}
