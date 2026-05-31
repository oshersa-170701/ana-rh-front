import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditarEmpleadoSupervisorComponent } from './editar-empleado-supervisor.component';

describe('EditarEmpleadoSupervisorComponent', () => {
  let component: EditarEmpleadoSupervisorComponent;
  let fixture: ComponentFixture<EditarEmpleadoSupervisorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [EditarEmpleadoSupervisorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarEmpleadoSupervisorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
