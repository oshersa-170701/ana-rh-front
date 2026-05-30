import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditarEmpleadoSuperadminComponent } from './editar-empleado-superadmin.component';

describe('EditarEmpleadoSuperadminComponent', () => {
  let component: EditarEmpleadoSuperadminComponent;
  let fixture: ComponentFixture<EditarEmpleadoSuperadminComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [EditarEmpleadoSuperadminComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarEmpleadoSuperadminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
