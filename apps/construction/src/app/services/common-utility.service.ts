import { Injectable, inject, computed, Signal } from '@angular/core';
import jwt_decode from 'jwt-decode';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { CountryInterface } from '../models/country';

@Injectable({
  providedIn: 'root',
})
export class CommonUtilityService {
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

  getCanadaInfo = toSignal<CountryInterface[], CountryInterface[]>(
    this.canadaInfo$,
    { initialValue: [] }
  );
  getCanada(): Signal<CountryInterface[]> {
    return computed(this.getCanadaInfo);
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
      console.log(decodedJWT, decodedJWT.subject[info]);
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
      'Password length must be between 8-12 characters',
      'Must include: one or more lowercase letters',
      'Must include: one or more uppercase letters',
      'Must include: one or more numbers',
      'Must include: one or more special characters',
    ];
  }
}
