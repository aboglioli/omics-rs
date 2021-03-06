import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { PublicationService } from 'src/app/domain/services/publication.service';
import { IPublication, IPage } from '../../domain/models/publication';
import { IGetByIdResponse, IReadResponse } from '../../domain/services/publication.service';
import { faChevronLeft, faChevronRight, faBookmark, faInfoCircle, faHeart  } from '@fortawesome/free-solid-svg-icons';
import { ActivatedRoute } from '@angular/router';
import { IReaderPublicationInteraction } from '../../domain/models/reader';
import { PublicationInfoComponent } from 'src/app/components/publication/publication-info/publication-info.component';
import { MatDialog } from '@angular/material/dialog';
import { IUser, can } from '../../domain/models/user';
import { IdentityService } from '../../domain/services/identity.service';

@Component({
  selector: 'app-visor-comic',
  templateUrl: './visor-comic.component.html',
  styleUrls: ['./visor-comic.component.scss']
})
export class VisorComicComponent implements OnInit {

  // Font Awseome icons
  public faLeft = faChevronLeft;
  public faRight = faChevronRight;
  public faLike = faHeart;
  public faFavorito = faBookmark;
  public faInfo = faInfoCircle;

  // Manejo de publicación
  public publicationToShow: IPublication;
  private publicationId: string;

  public readerInfo: IReaderPublicationInteraction;

  // Manejo de pagina
  public pagesList: IPage[];
  public pagesTotal: number;

  public pageCurrent: number;
  public pageToShow: string;

  public userData: IUser;
  public can = can;

  constructor(
    private spinnerService: NgxSpinnerService,
    private publicationService: PublicationService,
    private activateRoute: ActivatedRoute,
    private identityService: IdentityService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {

    this.pagesTotal = 0;
    this.pageCurrent = 0;

    this.identityService.getById( 'me', 'role' ).subscribe(
      (res) => {
        this.userData = res;
      }
    );

    this.getPublicationDataByParams();
  }

  private getPublicationDataByParams(): void {

    this.spinnerService.show();
    this.activateRoute.params.subscribe( params => {

      this.publicationService.getById(params.id).subscribe(

        (resPub: IGetByIdResponse) => {

          this.publicationToShow = resPub.publication;
          this.readerInfo = resPub.reader;

          this.publicationId = params.id;
          this.publicationService.read( this.publicationId ).subscribe(

            (resPages: IReadResponse) => {

              this.pagesList = resPages.pages;
              this.pagesTotal = this.pagesList.length;

              this.setCurrentPage(this.pageCurrent);

              this.spinnerService.hide();

            },
            (err: Error) => {
              console.error(err);
            }
          );


        },
        (err: Error ) => {
          console.error(err);
          this.spinnerService.hide();
        }

      );
    });

  }

  public setCurrentPage( numberPage: number ): void {

    if (  numberPage >= 0 && numberPage < this.pagesTotal ) {
      this.pageToShow = this.pagesList[numberPage].images[0].url;
      this.pageCurrent = numberPage;
    }

  }

  public onFavorito(): void {

    if ( !this.readerInfo.in_favorites  ) {

      this.publicationService.addToFavorites( this.publicationId ).subscribe(
        (res: any) =>  {

          this.readerInfo.in_favorites = true;
        }
      );

    } else {

      this.publicationService.removeFromFavorites( this.publicationId ).subscribe(
        (res: any) => {
          this.readerInfo.in_favorites = false;
        }
      );

    }


  }

  public onLike(): void {

    if (   this.readerInfo.liked  ) {

      this.publicationService.unlike( this.publicationId ).subscribe(
        (res: any) =>  {

          this.readerInfo.liked = false;
        }
      );

    } else {

      this.publicationService.like( this.publicationId ).subscribe(
        (res: any) => {
          this.readerInfo.liked = true;
        }
      );

    }

  }


  public onInfo(): void {

    const dialogRef = this.dialog.open(
      PublicationInfoComponent,
      {
        panelClass: 'info-publication',
        data: {
          idPublication: this.publicationId,
          showRead: false
        }
      }
    );

  }

}
