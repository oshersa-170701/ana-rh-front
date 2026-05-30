import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditarEmpresaComponent } from './editar-empresa.component';

describe('EditarEmpresaComponent', () => {
  let component: EditarEmpresaComponent;
  let fixture: ComponentFixture<EditarEmpresaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [EditarEmpresaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarEmpresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
