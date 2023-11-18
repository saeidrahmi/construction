import { Injectable, inject, computed, Signal } from '@angular/core';
import jwt_decode from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, take } from 'rxjs/operators';

import { CountryInterface } from '../models/country';

@Injectable({
  providedIn: 'root',
})
export class CommonUtilityService {
  _imageMimeTypes = ['png', 'jpg', 'gif', 'bmp', 'jpeg'];
  _companyLogoMaxSize = 100 * 1024; // 100 KB
  _advertisementHeaderMaxSize = 100 * 1024; // 100 KB
  _advertisementHeaderMinMaxWidthHeightPixel = [
    [140, 200], // width: 140-200,
    [140, 200], // height: 140-200,
  ];
  _profilePhotoMaxSize = 1 * 1024 * 1024; // 1 MB
  _profilePhotoMinMaxWidthHeightPixel = [
    [140, 200],
    [140, 200],
  ];
  _sliderPhotoMaxSize = 1 * 1024 * 1024;
  _sliderPhotoMinMaxWidthHeightPixel = [
    [800, 1800], // width: 800-1800,
    [300, 500], // height: 300-500,
  ];

  constructor() {}

  http = inject(HttpClient);
  canadaInfo$ = this.http
    .get<CountryInterface[]>('../../assets/canada.json')
    .pipe(
      take(1),
      map((response) => {
        const data = JSON.parse(JSON.stringify(response));
        const groupedData: CountryInterface[] = [];

        for (const [city, province] of data) {
          const existingProvince = groupedData.find(
            (item) => item.province === province
          );
          if (existingProvince) {
            existingProvince.cities.push(city);
          } else {
            groupedData.push({ province, cities: [city] });
          }
        }

        return groupedData;
      })
    );
  canadaCities$ = this.http
    .get<CountryInterface[]>('../../assets/canada.json')
    .pipe(
      take(1),
      map((response) => {
        const data = JSON.parse(JSON.stringify(response));
        const citeis: string[] = [];

        for (const [city, province] of data) {
          citeis.push(city + ' (' + province + ')');
        }

        return citeis;
      })
    );

  getCanadaInfo = toSignal<CountryInterface[], CountryInterface[]>(
    this.canadaInfo$,
    { initialValue: [] }
  );
  getCanadaCities = toSignal<string[], string[]>(this.canadaCities$, {
    initialValue: [],
  });

  getCanada(): Signal<CountryInterface[]> {
    return computed(this.getCanadaInfo);
  }
  getCities(): Signal<string[]> {
    return computed(this.getCanadaCities);
  }

  getFullProvinceName(shortName: string): string {
    const provinces: any = {
      AB: 'Alberta',
      BC: 'British Columbia',
      MB: 'Manitoba',
      NB: 'New Brunswick',
      NL: 'Newfoundland and Labrador',
      NS: 'Nova Scotia',
      ON: 'Ontario',
      PE: 'Prince Edward Island',
      QC: 'Quebec',
      SK: 'Saskatchewan',
      NT: 'Northwest Territories',
      NU: 'Nunavut',
      YT: 'Yukon',
    };

    return provinces[shortName] || 'Unknown Province';
  }
  getFullProvinces(): string[] {
    const provinces: string[] = [
      'Alberta',
      'British Columbia',
      'Manitoba',
      'New Brunswick',
      'Newfoundland and Labrador',
      'Nova Scotia',
      'Ontario',
      'Prince Edward Island',
      'Quebec',
      'Saskatchewan',
      'Northwest Territories',
      'Nunavut',
      'Yukon',
    ];

    return provinces;
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
}
