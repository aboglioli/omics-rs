import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Evita el refresh en formularios y manejado por angular
import { environment } from '../environments/environment';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { HttpClientModule  } from '@angular/common/http';

import { ServiceWorkerModule } from '@angular/service-worker'; // PWA dependencia
import { ToastrModule } from 'ngx-toastr';
import { ChartsModule } from 'ng2-charts';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';

// Modulos auxiliares
import { MaterialModule } from './auxiliar-modules/material.module';
import { AngularBootstrapModule } from './auxiliar-modules//angular-bootstrap.module';

// Componentes
import { HomeComponent } from './pages/home/home.component';
import { AboutComponent } from './pages/about/about.component';
import { LoginRegisterComponent } from './components/login-register/login-register.component';
import { VisorComicComponent } from './pages/visor-comic/visor-comic.component';
import { FavoritosComponent } from './pages/favoritos/favoritos.component';
import { PerfilComponent } from './pages/perfil/perfil.component';
import { SuscripcionComponent } from './components/suscripcion/suscripcion.component';
import { DonacionComponent } from './components/donacion/donacion.component';
import { DeskboardGeneralComponent } from './pages/deskboard-general/deskboard-general.component';
import { DashboardReportesComponent } from './pages/dashboard-reportes/dashboard-reportes.component';
import { DashboardGestionAdminComponent } from './pages/dashboard-gestion-admin/dashboard-gestion-admin.component';
import { DashboardGestionContratosPublicacionesComponent } from './pages/dashboard-gestion-contratos-publicaciones/dashboard-gestion-contratos-publicaciones.component';
import { DashboardReglasNegociosComponent } from './pages/dashboard-reglas-negocios/dashboard-reglas-negocios.component';
import { CatalogoComponent } from './pages/catalogo/catalogo.component';
import { RealizarAnalisisComponent } from './components/realizar-analisis/realizar-analisis.component';
import { ColeccionInfoComponent } from './pages/coleccion-info/coleccion-info.component';
import { ComicInfoComponent } from './components/comic-info/comic-info.component';
import { NavBarComponent } from './shared/nav-bar/nav-bar.component';
import { SideNavMenuMainComponent } from './shared/side-nav-menu-main/side-nav-menu-main.component';
import { AutoresComponent } from './pages/autores/autores.component';
import { UnderConstructionComponent } from './shared/under-construction/under-construction.component';
import { DeskboardMisComicsComponent } from './components/deskboard/deskboard-mis-comics/deskboard-mis-comics.component';
import { NewPublicationComponent } from './components/deskboard/new-publication/new-publication.component';
import { PublicationCardManagerComponent } from './components/publication-card-type/publication-card/publication-card-manager.component';
// --->

// Development
import { DevelopmentComponent } from './pages/development/development.component';
import { DevUploadFileComponent } from './pages/development/upload-file/upload-file';
import { DevNewPublicationComponent } from './pages/development/new-publication/new-publication';

// Domain
import { DomainModule } from './domain/module';
import { PasswordForgotComponent } from './components/password-recovery/password-forgot/password-forgot.component';
import { PasswordRewriteComponent } from './components/password-recovery/password-rewrite/password-rewrite.component';
import { SideNavMenuUserComponent } from './shared/side-nav-menu-user/side-nav-menu-user.component';
import { PerfilEditarComponent } from './pages/perfil-editar/perfil-editar.component';
import { PublicationApproveRejectMotiveComponent } from './components/publication-approve-reject-motive/publication-approve-reject-motive.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    LoginRegisterComponent,
    VisorComicComponent,
    FavoritosComponent,
    PerfilComponent,
    SuscripcionComponent,
    DonacionComponent,
    DeskboardGeneralComponent,
    DashboardReportesComponent,
    DashboardGestionAdminComponent,
    DashboardGestionContratosPublicacionesComponent,
    DashboardReglasNegociosComponent,
    CatalogoComponent,
    RealizarAnalisisComponent,
    ColeccionInfoComponent,
    ComicInfoComponent,
    NavBarComponent,
    SideNavMenuMainComponent,
    AutoresComponent,
    UnderConstructionComponent,
    DeskboardMisComicsComponent,
    NewPublicationComponent,
    PasswordForgotComponent,
    PasswordRewriteComponent,
    PublicationCardManagerComponent,

    DevelopmentComponent,
    DevUploadFileComponent,
    DevNewPublicationComponent,
    SideNavMenuUserComponent,
    PerfilEditarComponent,
    PublicationApproveRejectMotiveComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ReactiveFormsModule, // si se usa reactivos
    FormsModule, // Si se usa por template
    HttpClientModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    ChartsModule,
    ToastrModule.forRoot(),
    FontAwesomeModule,
    NgxSpinnerModule,
    SweetAlert2Module.forRoot(),

    // Custom modules
    DomainModule,
    MaterialModule,
    AngularBootstrapModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
