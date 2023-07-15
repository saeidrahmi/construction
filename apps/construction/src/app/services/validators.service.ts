import { Injectable } from '@angular/core';
import {
  AsyncValidatorFn,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormArray,
} from '@angular/forms';
import { Observable, map, catchError, of } from 'rxjs';

import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class ValidatorsService {
  constructor(private httpClient: HttpClient) {}
  //   private backendUrl: string = environment.apiBaseUrl + '';
  //   validateCompanyAsync(
  //     label: string,
  //     userId: string,
  //     companyId: string
  //   ): AsyncValidatorFn {
  //     return (control: AbstractControl): Observable<ValidationErrors | null> => {
  //       if (companyId) return of(null);
  //       else
  //         return this.checkCompanyExists({
  //           label: label,
  //           value: control.value,
  //           userId: userId,
  //         }).pipe(
  //           map((exists) => {
  //             return exists ? { fieldExists: true } : null;
  //           }),
  //           catchError((err) => {
  //             return of(null);
  //           })
  //         );
  //     };
  //   }
  //   checkCompanyExists(data: any): Observable<any> {
  //     return this.httpClient.post<Observable<any>>(
  //       environment.apiBaseUrl + 'users/checkCompanyExists',
  //       data
  //     );
  //   }

  //   isAccountUnique(): ValidatorFn {
  //     return (control: AbstractControl): ValidationErrors | null => {
  //       let items: string[] = [];
  //       (control as FormArray).value.forEach((element) => {
  //         if (items.indexOf(JSON.stringify(element)) == -1)
  //           items.push(JSON.stringify(element));
  //       });
  //       return items.length != (control as FormArray).value.length
  //         ? { fieldExists: true }
  //         : null;
  //     };
  //   }
  matchPassword: ValidatorFn = (
    control: AbstractControl
  ): ValidationErrors | null => {
    let pass = control.get('password')?.value;
    let confirmPass = control.get('confirmPassword')?.value;

    if (pass && confirmPass && pass !== confirmPass)
      return { matchError: true };
    else return null;
  };
}
