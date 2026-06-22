import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthStore } from '../../../application/auth.store';
import {RouterLink} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  authStore = inject(AuthStore);
  email = '';
  password = '';
  remember = false;
  showPassword = false;

  onSubmit() {
    if (this.email && this.password) {
      this.authStore.login(this.email, this.password);
    }
  }
}
