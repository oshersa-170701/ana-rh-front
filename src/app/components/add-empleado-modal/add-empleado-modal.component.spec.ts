import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddEmpleadoModalComponent } from './add-empleado-modal.component';

describe('AddEmpleadoModalComponent', () => {
  let component: AddEmpleadoModalComponent;
  let fixture: ComponentFixture<AddEmpleadoModalComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [AddEmpleadoModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddEmpleadoModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
