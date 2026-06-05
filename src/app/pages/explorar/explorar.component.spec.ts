import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ExplorarComponent } from './explorar.component';
import { ProfissionalService } from '../../services/profissional.service';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';

describe('ExplorarComponent', () => {
  let component: ExplorarComponent;
  let fixture: ComponentFixture<ExplorarComponent>;
  let profissionalService: jasmine.SpyObj<ProfissionalService>;
  let authService: jasmine.SpyObj<AuthService>;
  let modalService: jasmine.SpyObj<ModalService>;
  let router: Router;

  beforeEach(async () => {
    profissionalService = jasmine.createSpyObj<ProfissionalService>('ProfissionalService', ['listar']);
    authService = jasmine.createSpyObj<AuthService>('AuthService', ['isLoggedIn', 'getRole', 'logout']);
    modalService = jasmine.createSpyObj<ModalService>('ModalService', ['confirm']);

    profissionalService.listar.and.returnValue(of([]));
    authService.isLoggedIn.and.returnValue(false);
    authService.getRole.and.returnValue('CLIENTE');

    await TestBed.configureTestingModule({
      imports: [ExplorarComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParams: of({ q: 'barba', local: 'Cuiaba' }) } },
        { provide: ProfissionalService, useValue: profissionalService },
        { provide: AuthService, useValue: authService },
        { provide: ModalService, useValue: modalService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.resolveTo(true);
    spyOn(window, 'scrollTo');

    fixture = TestBed.createComponent(ExplorarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load filters from query params before listing professionals', () => {
    expect(component.termoBusca).toBe('barba');
    expect(component.cidadeBusca).toBe('Cuiaba');
    expect(profissionalService.listar).toHaveBeenCalledWith({ cidade: 'Cuiaba', q: 'barba' });
  });

  it('should reset filters and clear query params', () => {
    component.precomax = 100;
    component.avaliacaoMinima = 4.5;
    component.modalidade = 'Online';
    component.categorias['Beleza'] = true;
    component.tiposVendedor['Empresa'] = false;

    component.limparFiltros();

    expect(component.termoBusca).toBe('');
    expect(component.cidadeBusca).toBe('');
    expect(component.precomax).toBe(500);
    expect(component.avaliacaoMinima).toBe(0);
    expect(component.modalidade).toBe('todas');
    expect(component.categorias['Beleza']).toBeFalse();
    expect(component.tiposVendedor['Empresa']).toBeTrue();
    expect(router.navigate).toHaveBeenCalledWith(['/explorar'], { replaceUrl: true });
  });
});
