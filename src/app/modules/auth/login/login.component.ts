import {Component, OnInit} from '@angular/core';
import {NgOptimizedImage} from "@angular/common";
import {Router, RouterLink} from "@angular/router";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MessageErrorsDirective} from "@app/shared/directives/field-errors/directive/message-errors.directive";
import {AlertService} from "@app/core/services/alert.service";
import {AuthLogin} from "@app/modules/auth/interfaces/auth";
import {AuthService} from "@app/modules/auth/services/auth.service";
import {StorageService} from "@app/core/services/storage.service";
import {LoadingService} from "@app/core/services/loading.service";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    NgOptimizedImage,
    RouterLink,
    ReactiveFormsModule,
    MessageErrorsDirective
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup = new FormGroup({})

  // private _route = inject(Router)

  constructor(
    private _router: Router,
    private _alert: AlertService,
    private _auth: AuthService,
    private _storage: StorageService,
    private _loading: LoadingService
  ) {

  }

  ngOnInit(): void {
    this.initForm();
  }


  initForm(): void {
    this.loginForm = new FormGroup({
      user_email: new FormControl('', [Validators.required]),
      user_password: new FormControl('', [Validators.required]),
    })
  }

  sendLoginAuth() {
    if (this.loginForm.valid) {
      this._loading.show();
      // john@mail.com
      // changeme
      const dataAuth: AuthLogin = {
        username: this.loginForm.get('user_email')?.value,
        password: this.loginForm.get('user_password')?.value,
      }
      this._auth.login(dataAuth).subscribe({
        next: (data) => {
          this._storage.setItem('access_token', data.token);
          this._router.navigateByUrl('administration/product').then();
          this._loading.hide();
        }
      })

    } else {
      this.loginForm.markAllAsTouched()
    }

  }

}
