import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NominasPage } from './nominas.page';

describe('NominasPage', () => {
  let component: NominasPage;
  let fixture: ComponentFixture<NominasPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(NominasPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
