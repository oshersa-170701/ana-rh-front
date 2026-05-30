import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AgregarEmpleadoSuperadminComponent } from './agregar-empleado-superadmin.component';

describe('AgregarEmpleadoSuperadminComponent', () => {
  let component: AgregarEmpleadoSuperadminComponent;
  let fixture: ComponentFixture<AgregarEmpleadoSuperadminComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AgregarEmpleadoSuperadminComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AgregarEmpleadoSuperadminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
