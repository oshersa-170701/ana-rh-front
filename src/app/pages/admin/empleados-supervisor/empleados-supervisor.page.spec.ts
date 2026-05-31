import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpleadosSupervisorPage } from './empleados-supervisor.page';

describe('EmpleadosSupervisorPage', () => {
  let component: EmpleadosSupervisorPage;
  let fixture: ComponentFixture<EmpleadosSupervisorPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(EmpleadosSupervisorPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
