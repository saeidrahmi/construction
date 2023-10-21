/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { NewSupportComponent } from './new-support.component';

describe('NewSupportComponent', () => {
  let component: NewSupportComponent;
  let fixture: ComponentFixture<NewSupportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewSupportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
