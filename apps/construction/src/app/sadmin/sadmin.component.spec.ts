import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SAdminComponent } from './sadmin.component';

describe('SAdminComponent', () => {
  let component: SAdminComponent;
  let fixture: ComponentFixture<SAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SAdminComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
