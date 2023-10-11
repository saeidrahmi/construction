import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SAdminSideBarComponent } from './sadmin-side-bar.component';

describe('SAdminSideBarComponent', () => {
  let component: SAdminSideBarComponent;
  let fixture: ComponentFixture<SAdminSideBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SAdminSideBarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SAdminSideBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
