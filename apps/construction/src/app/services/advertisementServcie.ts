import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { AdvertisementInterface } from '../models/advertisement';

@Injectable({
  providedIn: 'root',
})
export class AdvertisementCommunicationService {
  private messageSource = new BehaviorSubject<AdvertisementInterface>({});
  message$ = this.messageSource.asObservable();

  sendMessage(advertisement: AdvertisementInterface) {
    this.messageSource.next(advertisement);
  }
}
