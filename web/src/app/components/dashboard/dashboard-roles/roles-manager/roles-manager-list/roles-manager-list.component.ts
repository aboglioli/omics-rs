import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { NgxSpinnerService } from 'ngx-spinner';
import { RolesManagerEditComponent } from '../roles-manager-edit/roles-manager-edit.component';
import { RoleService, IGetAllResponse } from '../../../../../domain/services/role.service';
import { IRole, IPermission } from '../../../../../domain/models/user';
import { forkJoin } from 'rxjs';

// TODO: Borrar luego de aplicar servicio

@Component({
  selector: 'app-roles-manager-list',
  templateUrl: './roles-manager-list.component.html',
  styleUrls: ['./roles-manager-list.component.scss']
})
export class RolesManagerListComponent implements OnInit {


  // Font Awseome icons
  public faAdd = faPlusCircle;

  permissionsData: IPermission[];

  // Información tablas roles
  tableRoleData: IRole[];
  displayedColumns: string[] = ['position', 'id', 'name', 'permissions', 'created_at', 'updated_at'];

  constructor(
    private dialog: MatDialog,
    private spinnerService: NgxSpinnerService,
    private roleService: RoleService
  ) { }

  ngOnInit(): void {

    this.getRoleData();

  }

  public getRoleData(): void {

    this.spinnerService.show();
    forkJoin( [ this.roleService.getAll(), this.roleService.getPermissions() ]).subscribe(

      ([resAllRoles, resAllPermissions]) => {

        this.tableRoleData = resAllRoles.roles;
        this.permissionsData = resAllPermissions.permissions;

        this.spinnerService.hide();

      },
    );

  }


  public onAddRol(): void {

    const dialogRef = this.dialog.open(
      RolesManagerEditComponent,
      {
        panelClass: 'info-publication',
        disableClose: true,
        data: {
          isNew: true,
        }
      }
    );

  }

  public onEditRole(roleElement: IRole): void {

    const dialogRef = this.dialog.open(
      RolesManagerEditComponent,
      {
        panelClass: 'info-publication',
        disableClose: true,

        data: {
          isNew: false,
          role: roleElement,
          permissionArrayToSelect: this.permissionsData
        }
      }
    );

  }



}
