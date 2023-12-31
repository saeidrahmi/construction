import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class CommonUtilityService {
  _maxUserRating = 10;
  _imageMimeTypes = ['png', 'jpg', 'gif', 'bmp', 'jpeg'];
  _companyLogoMaxSize = 100 * 1024; // 100 KB
  _advertisementHeaderMaxSize = 100 * 1024; // 100 KB
  _advertisementHeaderMinMaxWidthHeightPixel = [
    [150, 300], // width: 140-200,
    [150, 300], // height: 140-200,
  ];
  _profilePhotoMaxSize = 100 * 1024; // 1 * 1024 * 1024; // 1 MB
  _profilePhotoMinMaxWidthHeightPixel = [
    [100, 250],
    [100, 250],
  ];
  _sliderPhotoMaxSize = 1 * 1024 * 1024;
  _sliderPhotoMinMaxWidthHeightPixel = [
    [1000, 2000], // width: 800-1800,
    [400, 700], // height: 300-500,
  ];

  constructor() {}
  getMaxUserRating() {
    return this._maxUserRating;
  }

  isTokenValid(token: string): boolean {
    try {
      const decodedToken: any = jwt_decode(token);
      const currentTimestamp = Math.floor(Date.now() / 1000);
      // Check if the token is a valid JWT token
      if (!decodedToken || typeof decodedToken !== 'object') {
        return false;
      }
      // Check if the token is expired
      else if (decodedToken?.exp < currentTimestamp) {
        return false;
      }
      // Additional checks can be performed here if needed
      else return true;
    } catch (error) {
      return false;
    }
  }

  decodeStringJWTTokenInfo(token: string, info: string) {
    if (token) {
      let decodedJWT: any = jwt_decode(token);

      return decodedJWT.subject[info];
    } else return null;
  }
  trimString(data: string): string {
    const scriptPattern =
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script\s*>/gi;
    // static string Pattern = "<(?:[^>=]|='[^']*'|=\"[^\"]*\"|=[^'\"][^\\s>]*)*>";
    if (data) return data.trim().replace(scriptPattern, '');
    else return data;
    //return data.trim();
  }

  passwordRuleRegExp(): any {
    // Password length between 8-12. one or more lowercase letters ,one or more uppercase letters. one or more numbers
    //    one or more special characters
    let strongPassword = new RegExp(
      '(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,12})'
    );

    return strongPassword;
  }
  passwordRule(): string[] {
    return [
      'Do not use previous passwords.',
      'Password length must be between 8-12 characters',
      'Must include: one or more lowercase letters',
      'Must include: one or more uppercase letters',
      'Must include: one or more numbers',
      'Must include: one or more special characters',
    ];
  }
  convertBytesToKbOrMb(bytes: number): string {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  formatStringWithAnd(inputString) {
    // Split the string by commas
    const parts = inputString.split(', ');

    // Check if there are more than one part
    if (parts.length > 1) {
      // Remove the last comma if it exists
      const lastPartIndex = parts.length - 1;
      parts[lastPartIndex] = 'and ' + parts[lastPartIndex];
      if (parts[lastPartIndex - 1].endsWith(',')) {
        parts[lastPartIndex - 1] = parts[lastPartIndex - 1].slice(0, -1);
      }
    }

    // Join the parts back into a single string
    const resultString = parts.join(', ');

    return resultString;
  }
  generateRandomPassword(length: number): string {
    const charset =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_';
    const charsetArray = Array.from(charset);

    const password = Array.from(crypto.getRandomValues(new Uint32Array(length)))
      .map((value) => charsetArray[value % charsetArray.length])
      .join('');

    return password;
  }
  extractDescription(description: string) {
    if (description?.length < 400) return description;
    else return description?.substring(0, 200) + '...';
  }
}
