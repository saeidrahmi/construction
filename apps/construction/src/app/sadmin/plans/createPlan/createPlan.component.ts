import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { FormService } from '../../../services/form.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-createPlan',
  templateUrl: './createPlan.component.html',
  styleUrls: ['./createPlan.component.css'],
})
export class CreatePlanComponent {
  planType = '';
  form: FormGroup;
  formService = inject(FormService);
  formErrors: string[] = [];
  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      planName: new FormControl('', [Validators.required]),
      planType: new FormControl('', [Validators.required]),
      planDescription: new FormControl('', [Validators.required]),
      price: new FormControl('', [Validators.required]),
      numberOfAdvertisements: new FormControl('', [Validators.required]),
    });
    this.form
      .get('planType')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((value) => {
        if (value === 'free') {
          this.form.get('price')?.disable();
          this.form.get('price')?.setValue(0);
        } else {
          this.form.get('price')?.enable();
          this.form.get('price')?.setValue('');
        }
      });
  }
  submit() {
    if (this.form.invalid) {
      this.formErrors = this.formService.getFormValidationErrorMessages(
        this.form
      );
    } else {
    }
  }
  getPlanTypeInfo() {
    if (this.planType === 'free') return 'Trial Free';
    else return this.planType;
  }
}
