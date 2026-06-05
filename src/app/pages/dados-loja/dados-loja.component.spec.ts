import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { DadosLojaComponent } from './dados-loja.component';

describe('DadosLojaComponent', () => {
  let component: DadosLojaComponent;
  let fixture: ComponentFixture<DadosLojaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DadosLojaComponent, RouterTestingModule, HttpClientTestingModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DadosLojaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
