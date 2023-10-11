import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class FormService {
  constructor() {}
  toTitleCase(str: string) {
    if (str)
      return str?.toLowerCase().replace(/(?:^|\s)\w/g, function (match) {
        return match.toUpperCase();
      });
    else return null;
  }

  private formControls = [
    {
      filedName: 'firstName',
      filedValue: 'First Name',
    },
    {
      filedName: 'userId',
      filedValue: 'User Id/Email',
    },
    {
      filedName: 'lastName',
      filedValue: 'Last Name',
    },
    {
      filedName: 'phone',
      filedValue: 'Phone Number',
    },
    {
      filedName: 'fax',
      filedValue: 'Fax Number',
    },
    {
      filedName: 'age',
      filedValue: 'Age',
    },
    {
      filedName: 'businessNumber',
      filedValue: 'Business Number',
    },
    {
      filedName: 'companyName',
      filedValue: 'Company Name',
    },
    {
      filedName: 'city',
      filedValue: 'City',
    },
    {
      filedName: 'address1',
      filedValue: 'Address',
    },
    {
      filedName: 'zip',
      filedValue: 'Zip Code',
    },
    {
      filedName: 'confirmCheckbox',
      filedValue: 'Confirmation Checkbox',
    },
    {
      filedName: 'confirmPassword',
      filedValue: 'Confirmation Password',
    },
    {
      filedName: 'password',
      filedValue: 'Password',
    },
    {
      filedName: 'planName',
      filedValue: 'Plan Name',
    },
    {
      filedName: 'planType',
      filedValue: 'Plan Type',
    },
    {
      filedName: 'planDescription',
      filedValue: 'Plan Description',
    },
    {
      filedName: 'price',
      filedValue: 'Price',
    },
    {
      filedName: 'numberOfAdvertisements',
      filedValue: 'Number Of Advertisements',
    },
  ];

  getFormValidationErrorMessages(form: FormGroup): string[] {
    const formErrors: string[] = [];

    // Loop through each form control and check if it's invalid
    for (const controlName in form.controls) {
      const control = form.get(controlName);
      if (control?.invalid) {
        const errors = control.errors;
        for (const errorName in errors) {
          const errorMessage = this.getErrorMessage(
            controlName,
            errorName,
            errors[errorName]
          );
          formErrors.push(errorMessage);
        }
      }
    }

    // Check for form-level errors
    if (form.errors) {
      for (const errorName in form.errors) {
        const errorMessage = this.getErrorMessage(
          '',
          errorName,
          form.errors[errorName]
        );
        formErrors.push(errorMessage);
      }
    }

    return formErrors;
  }

  getFormControlLable(field: string) {
    return (
      this.formControls.filter((item) => item.filedName == field)[0]
        ?.filedValue || ''
    );
  }
  private getErrorMessage(
    controlName: string,
    errorName: string,
    errorValue: any
  ): string {
    const controlLabel = this.getFormControlLable(controlName) || controlName;

    switch (errorName) {
      case 'required':
        return `${controlLabel} is required.`;
      case 'email':
        return `${controlLabel} must be a valid email address.`;
      case 'pattern':
        return `${controlLabel} does not follow the rules. Select a valid password.`;
      case 'maxlength':
        return `${controlLabel} cannot be more than ${errorValue.requiredLength} characters long.`;
      case 'minlength':
        return `${controlLabel} must be at least ${errorValue.requiredLength} characters long.`;
      case 'min':
        return `${controlLabel} must be greater than or equal to ${errorValue.min}.`;
      case 'max':
        return `${controlLabel} must be less than or equal to ${errorValue.max}.`;
      case 'matchError':
        return `Passwords do not match.`;
      default:
        return `${controlLabel} has an invalid value: ${errorValue}.`;
    }
  }
  //  <app-form-errors [formErrors]="errors"></app-form-errors>
}
