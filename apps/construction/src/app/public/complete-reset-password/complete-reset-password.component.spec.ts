import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompleteResetPasswordComponent } from './complete-reset-password.component';

describe('CompleteResetPasswordComponent', () => {
  let component: CompleteResetPasswordComponent;
  let fixture: ComponentFixture<CompleteResetPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompleteResetPasswordComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CompleteResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
