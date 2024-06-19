import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MessageErrorsDirective} from "@app/shared/directives/field-errors/directive/message-errors.directive";
import {RouterLink} from "@angular/router";
import {NgSelectModule} from "@ng-select/ng-select";
import {AlertService} from "@app/core/services/alert.service";
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ProductsService} from "@app/modules/products/services/products.service";
import {TrimDirective} from "@app/shared/directives/trim.directive";
import {InputMaskDirective} from "@app/shared/directives/input-mask/input-mask.directive";
import {LoadingService} from "@app/core/services/loading.service";
import {Observable} from "rxjs";
import {IMAGE_lOGO_EXTENSIONS} from "@app/core/utils/consts";

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [
    FormsModule,
    MessageErrorsDirective,
    ReactiveFormsModule,
    RouterLink,
    NgSelectModule,
    TrimDirective,
    InputMaskDirective
  ],
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.scss'
})
export class ProductEditComponent implements OnInit {

  productForm: FormGroup = new FormGroup({})
  screen: number = 1;
  images: string = '';

  category: any = []

  constructor(
    private _alert: AlertService,
    private _product: ProductsService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private _dialog: MatDialogRef<ProductEditComponent>,
    private _loading: LoadingService
  ) {
  }

  ngOnInit(): void {
    this.initForm();
    this.getCategories();
    if (this.data) {
      this.getProductById(this.data)
    }
  }

  getProductById(id: any) {
    this._loading.show();
    this._product.getProductById(id).subscribe({
      next: (data) => {
        console.log(data)
        this.setDataProduct(data);
        this._loading.hide();
        this.images = data.product_image;
      }
    })
  }

  setDataProduct(data: any) {
    this.productForm.get('title')?.setValue(data['product_name']);
    this.productForm.get('price')?.setValue(data['product_price']);
    this.productForm.get('description')?.setValue(data['product_detail']);
    this.productForm.get('categoryId')?.setValue(data['category_id']);
  }

  changeScreen(screen: number) {
    if (this.productForm.valid) {
      this.screen = screen;
    } else {
      this.productForm.markAllAsTouched();
      this._alert.warning('Debes completar todos los campos')
    }
  }

  initForm(): void {
    this.productForm = new FormGroup({
      title: new FormControl('', [Validators.required, Validators.maxLength(50), Validators.minLength(3)]),
      description: new FormControl('', [Validators.required, Validators.maxLength(500), Validators.minLength(3)]),
      price: new FormControl('', [Validators.required]),
      categoryId: new FormControl(null, [Validators.required]),
      images: new FormControl(''),
    })
  }

  getCategories() {
    this._product.getCategories().subscribe({
      next: (data: any) => {
        this.category = data;
      }
    })
  }

  addImage(event: any): void {
    const capturedFile = event.target.files[0];

    const isValidImage = IMAGE_lOGO_EXTENSIONS.some(extension =>
      extension === capturedFile.type
    )

    if (isValidImage) {
      this._product.converterToBase64(capturedFile).subscribe({
        next: (base64data): void => {
          this.images = base64data;
          this._alert.success('Imagen subida correctamente');
        },
      });
    } else {
      this._alert.warning('Tipo de imágen no soportado');
    }
  }

  deleteImage() {
    this.images = '';
    this._alert.success("Imagen eliminado exitosamente")
  }

  sendDataRegisterProduct() {
    if (this.productForm.valid && this.images) {
      this._loading.show();
      const dataProduct: any = {
        product_name: this.productForm.get("title")?.value,
        product_price: this.productForm.get("price")?.value,
        product_detail: this.productForm.get("description")?.value,
        category_id: this.productForm.get("categoryId")?.value,
        product_image: this.images
      }

      const petition: Observable<any> = this.data ? this._product.updateProduct(this.data, dataProduct) :
        this._product.saveProduct(dataProduct);
      petition.subscribe({
        next: () => {
          this.productForm.reset();
          this.images = '';
          this.data ?
            this._alert.success('Producto actualizado exitosamente') : this._alert.success('Producto registrado exitosamente')
          this._dialog.close(true);
          this._loading.hide();

        },
        error: (error) => {
          this.data ?
            this._alert.error(error.error.data) : this._alert.error("Hubo un problema al registrar el producto.");
          this._loading.hide();
        }
      });
    } else {
      this._alert.warning('Debes agregar una imagen')
    }
  }

}
