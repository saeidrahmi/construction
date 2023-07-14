import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';
@Injectable({
  providedIn: 'root',
})
export class CommonUtilityService {
  constructor() {}
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
