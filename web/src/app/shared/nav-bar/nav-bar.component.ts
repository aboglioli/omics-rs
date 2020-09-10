import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { faBars, faBell } from '@fortawesome/free-solid-svg-icons';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { LoginRegisterComponent } from '../../components/login-register/login-register.component';
import { AuthService } from 'src/app/domain/services/auth.service';
import { SweetAlertGenericMessageService } from 'src/app/services/sweet-alert-generic-message.service';
import { IdentityService } from 'src/app/domain/services/identity.service';
import { IUser } from 'src/app/domain/models';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  @Output() clickSideNavMainToggle = new EventEmitter();
  @Output() clickSideNavUserToggle = new EventEmitter();

  // Font Awseome icons
  public faBars = faBars;
  public faBell = faBell;

  // Propios
  public isAccessUserLogIn: boolean;  // Para habilitar algunas acciones según si esta el usuario logueado
  public userData: IUser;
  public userAvatar: string;

  constructor(  private router: Router,
                private authService: AuthService,
                private dialog: MatDialog,
                private sweetAlertGenericService: SweetAlertGenericMessageService,
                private identifyService: IdentityService ) {


    this.subscribeAuthService();

  }

  ngOnInit(): void {

    this.isAccessUserLogIn = this.authService.isLoggedIn();

    if (  this.isAccessUserLogIn ) {
      const userId = this.authService.getIdUser();
      this.setAvatarImageFromUser( userId );
    }

  }

  public toggleSideNavMainMenu(): void {

    this.clickSideNavMainToggle.emit();

  }

  public goToPage( pagePath: string ): void {

    this.router.navigate( ['/', pagePath] );

  }

  public openLoginRegisterDialog(): void {

    const dialogRef = this.dialog.open(LoginRegisterComponent);

  }


  //#region User Actions
  public showNotifications(): void {

    // TODO: Agregar sistema de notificaciones como otro componente interno
    this.sweetAlertGenericService.showUnderConstrucction();

  }


  public toggleSideNavUserMenu(): void {

    this.clickSideNavUserToggle.emit();

  }

  //#endregion

  private setAvatarImageFromUser( idUser: string): void {

    this.identifyService.getById(idUser).subscribe( (data: IUser) => {

      this.userData = data;

      if ( this.userData.profile_image ) {
        this.userAvatar = this.userData.profile_image;
      } else {
        this.userAvatar = undefined;
      }

    } );

  }

  //#region  Auth User
  private subscribeAuthService(): void {

    // Para comprobar en tiempo real si tiene o no acceso el usuario
    this.authService.accessUser$.subscribe( (data: boolean) => {

      // Para actualizar si el usuario no esta más logueado
      if ( data === false && this.isAccessUserLogIn ) {

        this.isAccessUserLogIn = false;
        this.logout();

      } else {

        this.isAccessUserLogIn = data;

        if ( this.isAccessUserLogIn ){
          const userId = this.authService.getIdUser();
          this.setAvatarImageFromUser( userId );
        }


      }

    } );

  }


  public logout(): void {

    this.authService.logout();
    this.router.navigate(['/home']);

  }

  //#endregion


}
