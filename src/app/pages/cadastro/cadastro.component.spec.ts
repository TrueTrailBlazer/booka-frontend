import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { throwError } from 'rxjs';

import { CadastroComponent } from './cadastro.component';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

describe('CadastroComponent', () => {
  let component: CadastroComponent;
  let fixture: ComponentFixture<CadastroComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let modalService: jasmine.SpyObj<ModalService>;

  beforeEach(async () => {
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['register']);
    modalService = jasmine.createSpyObj<ModalService>('ModalService', ['alert']);

    await TestBed.configureTestingModule({
      imports: [CadastroComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        { provide: ModalService, useValue: modalService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CadastroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show modal when backend returns 409 on register', () => {
    authService.register.and.returnValue(throwError(() => ({ status: 409 })));
    component.fullName = 'Cliente Booka';
    component.email = 'cliente@booka.local';
    component.password = 'Password1!';
    component.confirmPassword = 'Password1!';

    component.onSubmit();

    expect(modalService.alert).toHaveBeenCalledWith(
      'E-mail já cadastrado',
      jasmine.any(String),
      'Entendi'
    );
    expect(component.errorMessage).toBe('');
  });

  it('should keep generic inline error for non-409 register errors', () => {
    authService.register.and.returnValue(throwError(() => ({ status: 500 })));
    component.fullName = 'Cliente Booka';
    component.email = 'cliente@booka.local';
    component.password = 'Password1!';
    component.confirmPassword = 'Password1!';

    component.onSubmit();

    expect(modalService.alert).not.toHaveBeenCalled();
    expect(component.errorMessage).toBe('Erro ao realizar cadastro. Verifique os dados e tente novamente.');
  });
});
