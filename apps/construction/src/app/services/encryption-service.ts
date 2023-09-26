import { Injectable } from '@angular/core';
import { AES } from 'crypto-js';
import { EnvironmentInfo } from 'libs/common/src/models/common';
@Injectable({
  providedIn: 'root',
})
export class EncryptionService {
  env: EnvironmentInfo = new EnvironmentInfo();
  encryptItem(item: string): string {
    const webSecretKey = this.env.webSecretKey();
    const encryptedItem = AES.encrypt(item, webSecretKey).toString();
    return encryptedItem;
  }

  encryptCredentials(userId: string, password: string): string {
    const webSecretKey = this.env.webSecretKey();
    const encryptedUsername = AES.encrypt(userId, webSecretKey).toString();
    const encryptedPassword = AES.encrypt(password, webSecretKey).toString();
    // Concatenate the encrypted username and password with a delimiter
    const encryptedCredentials = encryptedUsername + ':' + encryptedPassword;

    // return btoa(encryptedCredentials); // Encode the encrypted credentials using Base64
    return encryptedCredentials; // Encode the encrypted credentials using Base64
  }
}
