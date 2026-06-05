import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let router: Router;

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj<AuthService>('AuthService', ['login', 'getMe']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authServiceSpy },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show error if email or password are empty', () => {
    component.email = '';
    component.password = '';
    component.onSubmit();
    expect(component.errorMessage).toBe('Por favor, preencha todos os campos!');
    expect(authServiceSpy.login).not.toHaveBeenCalled();
  });

  it('should call authService.login on submit with valid credentials', () => {
    authServiceSpy.login.and.returnValue(of({ token: 'mock-token' }));
    authServiceSpy.getMe.and.returnValue(of({
      user: { id: '1', nome: 'Cliente', email: 'test@test.com', role: 'CLIENTE' },
      loja: null,
    }));

    component.email = 'test@test.com';
    component.password = 'password123';
    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalledWith('test@test.com', 'password123');
    expect(router.navigate).toHaveBeenCalledWith(['/explorar']);
  });

  it('should show error message on login failure', () => {
    authServiceSpy.login.and.returnValue(throwError(() => new Error('Login failed')));

    component.email = 'wrong@test.com';
    component.password = 'wrong123';
    component.onSubmit();

    expect(authServiceSpy.login).toHaveBeenCalled();
    expect(component.errorMessage).toBe('Email ou senha incorretos. Tente novamente.');
    expect(component.isLoading).toBeFalse();
  });
});
