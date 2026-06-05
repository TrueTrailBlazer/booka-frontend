import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { ServicosComponent } from './pages/servicos/servicos.component';
import { AgendaComponent } from './pages/agenda/agenda.component';
import { BloqueiosComponent } from './pages/bloqueios/bloqueios.component';
import { ConfiguracoesComponent } from './pages/configuracoes/configuracoes.component';
import { DadosLojaComponent } from './pages/dados-loja/dados-loja.component';
import { ClientesComponent } from './pages/clientes/clientes.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { NotificacoesComponent } from './pages/notificacoes/notificacoes.component';
import { LoginComponent } from './pages/login/login.component';
import { CadastroComponent } from './pages/cadastro/cadastro.component';
import { RecuperarSenhaComponent } from './pages/recuperar-senha/recuperar-senha.component';
import { AgendarComponent } from './pages/agendar/agendar.component';
import { OnboardingComponent } from './pages/onboarding/onboarding.component';
import { NovaSenhaComponent } from './pages/nova-senha/nova-senha.component';
import { HomeMarketplaceComponent } from './pages/home-marketplace/home-marketplace.component';
import { ExplorarComponent } from './pages/explorar/explorar.component';
import { MeusAgendamentosComponent } from './pages/meus-agendamentos/meus-agendamentos.component';
import { roleProfissionalGuard, roleClienteGuard } from './guards/role.guard';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [
  // Rotas públicas
  { path: '', component: HomeMarketplaceComponent },
  { path: 'explorar', component: ExplorarComponent },
  { path: 'login', component: LoginComponent },
  { path: 'cadastro', component: CadastroComponent },
  { path: 'recuperar-senha', component: RecuperarSenhaComponent },
  { path: 'nova-senha', component: NovaSenhaComponent },
  { path: 'agendar/:idLoja', component: AgendarComponent },

  // Rotas do painel profissional
  { path: 'dashboard', component: DashboardComponent, canActivate: [roleProfissionalGuard] },
  { path: 'servicos', component: ServicosComponent, canActivate: [roleProfissionalGuard] },
  { path: 'agenda', component: AgendaComponent, canActivate: [roleProfissionalGuard] },
  { path: 'bloqueios', component: BloqueiosComponent, canActivate: [roleProfissionalGuard] },
  { path: 'configuracoes', component: ConfiguracoesComponent, canActivate: [roleProfissionalGuard] },
  { path: 'dados-loja', component: DadosLojaComponent, canActivate: [roleProfissionalGuard] },
  { path: 'clientes', component: ClientesComponent, canActivate: [roleProfissionalGuard] },
  { path: 'perfil', component: PerfilComponent, canActivate: [authGuard] },
  { path: 'notificacoes', component: NotificacoesComponent, canActivate: [authGuard] },
  { path: 'onboarding', component: OnboardingComponent, canActivate: [roleProfissionalGuard] },

  // Rotas do cliente
  { path: 'meus-agendamentos', component: MeusAgendamentosComponent, canActivate: [roleClienteGuard] },
];