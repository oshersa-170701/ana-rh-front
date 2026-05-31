import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeSupervisorPage } from './home-supervisor.page';

describe('HomeSupervisorPage', () => {
  let component: HomeSupervisorPage;
  let fixture: ComponentFixture<HomeSupervisorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeSupervisorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
