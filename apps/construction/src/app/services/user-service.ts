import { Injectable, Signal, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';
import { CommonUtilityService } from './common-utility.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  commonUtility = inject(CommonUtilityService);
  apiService = inject(ApiService);
  isUserTokenValid(token: string): boolean {
    let tokenValid = signal<boolean>(false);
    if (!!token) {
      tokenValid.set(this.commonUtility.isTokenValid(token as string));
      if (tokenValid()) {
        tokenValid.mutate(
          toSignal(
            this.apiService.checkUserToken(token).pipe(
              tap((response) => {
                console.log('res', response);
              }),
              catchError((err) => {
                tokenValid.set(false);
                return of(false);
              })
            )
          )
        );
      } else {
        tokenValid.set(false);
      }
    } else {
      tokenValid.set(false);
    }

    return tokenValid();
  }

  private constructionServices: string[] = [
    'General Contracting',
    'Design-Build',
    'Construction Management',
    'Residential Construction',
    'Commercial Construction',
    'Industrial Construction',
    'Civil Engineering and Infrastructure',
    'Renovation and Remodeling',
    'Demolition Services',
    'Excavation and Grading',
    'Foundation Construction',
    'Carpentry Services',
    'Masonry Services',
    'Electrical Services',
    'Plumbing Services',
    'HVAC (Heating, Ventilation, and Air Conditioning)',
    'Roofing Services',
    'Painting and Finishing',
    'Flooring Services',
    'Concrete Services',
    'Landscaping and Exterior Design',
    'Siding Installation',
    'Environmental Remediation',
    'Project Management and Consultation',
    'Sustainable and Green Building',
    'Interior Design',
    'Architectural Services',
    'Fire and Safety Systems',
    'Insulation Installation',
    'Custom Home Building',
  ];
  getConstructionServices() {
    return this.constructionServices;
  }
}
