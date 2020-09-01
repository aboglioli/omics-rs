import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import {COMMA, ENTER} from '@angular/cdk/keycodes';

import { faPlusCircle, faTimesCircle, faBookOpen } from '@fortawesome/free-solid-svg-icons';

import { AuthService } from '../../../domain/services/auth';
import { FileService } from '../../../domain/services/file';
import { DropdownDataObrasService } from '../../../services/dropdown-data-obras.service';
import { NgxSpinnerService } from 'ngx-spinner';

import { IPublication } from '../../../domain/models/publication';
import { IDropdownItem } from '../../../models/dropdown-item.interface';
import { MatChipInputEvent } from '@angular/material/chips';
import { SwalComponent } from '@sweetalert2/ngx-sweetalert2';


@Component({
  selector: 'app-new-publication',
  templateUrl: './new-publication.component.html',
  styleUrls: ['./new-publication.component.scss']
})
export class NewPublicationComponent implements OnInit {

  @ViewChild('formDataInvalid') private swalFormDataInvalid: SwalComponent;
  @ViewChild('formDataValid') private swalFormDataValid: SwalComponent;

  // FontAwesome Icon
  public faPlus = faPlusCircle;
  public faCloseCircle = faTimesCircle;
  public faBoookOpen = faBookOpen;

  // Usados para Forms
  public formPublication: FormGroup;
  public publicationNewObject: IPublication;
  public collectionList: IDropdownItem[];
  public portadaImage: string;
  public categoryList: IDropdownItem[];
  public tagsList: string[] = [];


  // Otros
  public ripplePortadaEnable = true;

  public chipTagsKeysCodes: number[] = [ENTER, COMMA]; // Usado para los tags

  constructor(
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private spinnerService: NgxSpinnerService,
    private dropdownDataObrasService: DropdownDataObrasService,
    private fileServ: FileService,
  ) { }

  ngOnInit(): void {

    this.authService.authStart();
    this.buildForms();
    this.setSubscriptionData();

  }

  public backToDeskboard(): void {

    this.router.navigate(['/deskboard'] );

  }

  private buildForms(): void {

    this.formPublication = this.fb.group({

      cover: ['', Validators.required ],
      name: ['', [ Validators.required, Validators.minLength(5) ] ],
      collectionArray: this.fb.array([]),
      synopsis: [ '', [ Validators.required, Validators.minLength(5),  Validators.maxLength(512) ] ],
      category_id: [ '', Validators.required ],
      tags: [ null ],
      pagesList: this.fb.array([])

    });

  }


  public setSubscriptionData(): void {

    this.spinnerService.show();
    setTimeout(() => {
      this.spinnerService.hide();
    }, 5000);

    const observableList =  [ this.dropdownDataObrasService.getAllCollectionDropdownDataById(),
                              this.dropdownDataObrasService.getAllCategoryDropdown()
                            ];

    forkJoin( observableList).subscribe(([ dataCollection, dataCategory ]) => {

      this.collectionList = dataCollection;
      this.categoryList = dataCategory;

      this.spinnerService.hide();


      });

  }

  public uploadImagePortada(): void {

    // Crear elemento input de tipo 'file' para poder manejarlo desde el botón que lo llama
    const inputFileElement = document.createElement('input');
    inputFileElement.type = 'file'; // Nota:  Solo uno a la vez, para varios: inputFileElement.multiple = multiple
    inputFileElement.accept = '.png, .jpg, .jpeg';
    inputFileElement.click();

    // Definir la función del llamado al hacer click (cuando realiza un cambio)
    inputFileElement.onchange = ( event: any ) => {

      const fdImage: FormData = new FormData();
      const imagePortada  = event.target.files[0];

      // #region Cargar para previsualizar en pantalla

      const reader = new FileReader();
      reader.onload = (eventReader: any ) => {

        this.portadaImage = eventReader.target.result;

      };

      reader.readAsDataURL(imagePortada);

      //#endregion

      fdImage.append('image', imagePortada, imagePortada.name);
      this.formPublication.get('cover').setValue(fdImage);
      console.log('TEST > ', imagePortada );
      console.log('TEST > ', fdImage.getAll('image') );

      this.fileServ.upload(fdImage).subscribe(
        req => {
          this.formPublication.get('cover').setValue(req.files[0].url);
        },
        err => console.log(err),
      );

    };

  }

  public guardarBorrador(): void {
    if (!this.formPublication.valid) {
      this.swalFormDataInvalid.fire();
      return;
    }

    console.log(this.formPublication.controls);

    console.log('TEST > Guardar en borrador');

    this.swalFormDataValid.fire();
  }

  public submitPublication(): void {

    this.formPublication.get('tags').setValue(this.tagsList);

    // Reducir descripción los espacios vacios que pueda tener al final
    const description = this.formPublication.get('synopsis');
    this.formPublication.get('synopsis').setValue(description.value.trim());

    console.log('TEST > Submit Publication > ', this.formPublication.value );

    if ( this.formPublication.invalid ) {

      this.swalFormDataInvalid.fire();

      return Object.values( this.formPublication.controls ).forEach( control => {

        // Si es un objeto
        if ( control instanceof FormGroup ) {

          Object.values( control.controls ).forEach( subControl => subControl.markAsTouched() );

        } else {

          control.markAsTouched(); // Marcar todos como tocadas

        }

      } );

    } else {


      // Lo necesario para enviarse
      this.pagesList.controls.forEach(element => {
        element.get('thumbailImage').disable();
      });

      // TODO: Realizar el enviado y lectura correcta de datos
      this.swalFormDataValid.fire();


      // Activar luego para visualizar TODO: ¿Debe mantenerse así o se puede enviar y que se ignore en el back?
      this.pagesList.controls.forEach(element => {
        element.get('thumbailImage').enable();
      });

    }

  }


  // #region Dropdown Checkbox Collection

  public onCheckboxChangeCollection( event: MatCheckbox ): void {

    // Comprobar si debe agregarlo a lista o no
    if (  event.checked ) {

      this.collectionArrayCheck.push( new FormControl( event.value ) );

    } else {

      // Busca en todo el array el elemento que tiene el mismo valor que el que se saco para quitarlo del array
      let i = 0;
      this.collectionArrayCheck.controls.forEach( (item: FormControl) => {

        if ( item.value === event.value ) {

          this.collectionArrayCheck.removeAt(i);
          return;

        }

        i++;

      });

    }

  }

  public onRadioChangeCollection(): void {

    this.collectionArrayCheck.clear();

  }

  public isNotCheckedAllCollection(): boolean {

    return (this.collectionArrayCheck.length === 0);

  }

  public isCheckedCollectionItem( item: IDropdownItem ): boolean {

    return( (this.collectionArrayCheck.value as Array<string> ).indexOf(item.valueId) > -1 );

  }

  // #endregion

  // #region Tags

  public addTag( event: MatChipInputEvent): void {

    const input = event.input;
    const value = event.value.trim();

    if ((value || '')) {

      this.tagsList.push(value);

    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  public removeTag( tag: string ): void {

    const index = this.tagsList.indexOf(tag);

    if (index >= 0) {
      this.tagsList.splice(index, 1);
    }

  }

  // #endregion

  //#region

  public addPage(): void {

      const newPage = this.newPage();

      // Crear elemento input de tipo 'file' para poder manejarlo desde el botón que lo llama
      const inputFileElement = document.createElement('input');
      inputFileElement.type = 'file'; // Nota:  Solo uno a la vez, para varios: inputFileElement.multiple = multiple
      inputFileElement.accept = '.png, .jpg, .jpeg';
      inputFileElement.click();

      // Definir la función del llamado al hacer click (cuando realiza un cambio)
      inputFileElement.onchange = ( event: any ) => {

        const fdImage: FormData = new FormData();
        const pageImage  = event.target.files[0];

        // #region Cargar para previsualizar en pantalla

        const reader = new FileReader();
        reader.onload = (eventReader: any ) => {

          newPage.get('thumbailImage').setValue(eventReader.target.result);

        };

        reader.readAsDataURL(pageImage);

        //#endregion

        // #region Generar un nombre para enviar el archivo
        let imageName =  pageImage.lastModified + pageImage.name;
        imageName = imageName.replace(/\s+/g, '-').toLowerCase();
        imageName = imageName.substr(0, imageName.lastIndexOf('.'));
        // #endregion

        fdImage.append('image', pageImage, imageName);
        newPage.get('image').setValue(fdImage);

        this.pagesList.push( newPage );
        // console.log('TEST > ', newPage );
        // console.log('TEST > ', fdImage.getAll('image') );

      };


  }

  public removePage( index: number ): void {

    this.pagesList.removeAt( index );

    // console.log('TEST> ', this.pagesList.value[i]);

    const listLength = this.pagesTotal;
    for ( let i = index; i < listLength; i++ ) {

      this.pagesList.value[i].number = i + 1;

    }

  }

  public newPage(): FormGroup {
    return this.fb.group({

      number: this.pagesList.length + 1,
      image: [new FileReader(), Validators.required  ],
      thumbailImage: ''

    });
  }

  //#endregion

  // #region Getters

  get nombreNovalido(): boolean {
    return ( this.formPublication.get('name').invalid && this.formPublication.get('name').touched );
  }

  get synopsisNovalido(): boolean {
    return ( this.formPublication.get('synopsis').invalid && this.formPublication.get('synopsis').touched );
  }

  get synopsisLenght(): number {
    return this.formPublication.get('synopsis').value.length;
  }

  get pagesList(): FormArray  {
    return this.formPublication.get('pagesList') as FormArray;
  }

  get pagesTotal(): number {
    return this.pagesList.length;
  }

  get collectionArrayCheck(): FormArray {
    return this.formPublication.get('collectionArray') as FormArray;
  }

  //#endregion

}
