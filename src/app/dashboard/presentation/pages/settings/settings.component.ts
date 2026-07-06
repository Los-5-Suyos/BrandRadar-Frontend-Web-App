import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ImageCropperComponent } from 'ngx-image-cropper';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageCropperComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  router = inject(Router);
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;
  private serverBaseUrl = environment.apiBaseUrl.replace('/api/v1', '');

  userId: string | null = null;

  fullName = '';
  username = '';
  language = 'ES';
  timezone = 'GMT-5';
  emailNotifications = true;
  selectedAvatar: string | null = null;
  showCropper = false;
  imageChangedEvent: Event | null = null;
  croppedImage: string | null = null;
  guardandoPerfil = false;
  perfilGuardadoOk = false;
  perfilError = '';

  showPasswordModal = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  cambiandoPassword = false;
  passwordError = '';
  passwordSuccess = false;

  showUsernameModal = false;
  newUsername = '';
  cambiandoUsername = false;
  usernameError = '';
  usernameSuccess = false;

  get userName() {
    const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
    return this.fullName || this.username || email.split('@')[0] || 'Usuario';
  }

  get userEmail() {
    return typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
  }

  workspaceName = 'Workspace';

  get planLabel(): string {
    const plan =
      typeof window !== 'undefined' ? localStorage.getItem('workspacePlan') || 'FREE' : 'FREE';
    if (plan === 'PRO') return 'Pro';
    if (plan === 'ENTERPRISE') return 'Enterprise';
    return 'Basic';
  }

  ngOnInit() {
    if (typeof window === 'undefined') return;
    this.userId = localStorage.getItem('userId');
    if (!this.userId) return;

    const workspaceId = localStorage.getItem('currentWorkspaceId');
    if (workspaceId) {
      this.http.get<any>(`${this.baseUrl}/workspaces/${workspaceId}`).subscribe({
        next: (ws) => {
          this.workspaceName = ws.name;
        },
        error: () => {},
      });
    } else {
      // Si el usuario no está dentro de un workspace (p.ej. entró directo a
      // Configuración de Cuenta desde el sidebar de Home), mostramos el nombre
      // de su primer workspace en lugar del texto genérico "Workspace".
      this.http.get<any[]>(`${this.baseUrl}/workspaces/user/${this.userId}`).subscribe({
        next: (list) => {
          if (list && list.length > 0) {
            this.workspaceName = list[0].name;
          }
        },
        error: () => {},
      });
    }

    this.http.get<any>(`${this.baseUrl}/user-accounts/${this.userId}`).subscribe({
      next: (data) => {
        this.fullName = data.fullName || '';
        this.username = data.username || '';
        this.language = data.language || 'ES';
        this.timezone = data.timezone || 'GMT-5';
        this.emailNotifications = data.emailNotifications ?? true;
        this.selectedAvatar = data.avatarUrl ? `${this.serverBaseUrl}${data.avatarUrl}` : null;
      },
    });
  }

  actualizarPerfil() {
    if (!this.userId) return;
    this.guardandoPerfil = true;
    this.perfilError = '';
    this.perfilGuardadoOk = false;
    this.http
      .patch(`${this.baseUrl}/user-accounts/${this.userId}`, {
        fullName: this.fullName,
        language: this.language,
        timezone: this.timezone,
        emailNotifications: this.emailNotifications,
      })
      .subscribe({
        next: () => {
          this.guardandoPerfil = false;
          this.perfilGuardadoOk = true;
          setTimeout(() => (this.perfilGuardadoOk = false), 2500);
        },
        error: () => {
          this.guardandoPerfil = false;
          this.perfilError = 'No se pudo guardar el perfil. Intenta nuevamente.';
        },
      });
  }

  abrirModalUsername() {
    this.showUsernameModal = true;
    this.newUsername = this.username;
    this.usernameError = '';
    this.usernameSuccess = false;
  }

  cerrarModalUsername() {
    this.showUsernameModal = false;
  }

  cambiarUsername() {
    if (!this.userId) return;
    const valor = this.newUsername.trim();
    if (!/^[a-zA-Z0-9._-]{3,}$/.test(valor)) {
      this.usernameError = 'Debe tener al menos 3 caracteres (letras, números, puntos, guiones)';
      return;
    }
    this.usernameError = '';
    this.cambiandoUsername = true;
    this.http.patch(`${this.baseUrl}/user-accounts/${this.userId}`, { username: valor }).subscribe({
      next: () => {
        this.username = valor;
        this.cambiandoUsername = false;
        this.usernameSuccess = true;
        setTimeout(() => {
          this.showUsernameModal = false;
          this.usernameSuccess = false;
        }, 1200);
      },
      error: (err) => {
        this.cambiandoUsername = false;
        this.usernameError =
          err.status === 409
            ? 'Ese nombre de usuario ya está en uso.'
            : 'No se pudo actualizar el nombre de usuario.';
      },
    });
  }

  onAvatarSelected(event: Event) {
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  imageCropped(event: any) {
    this.croppedImage = event.base64 ?? null;
  }

  applyCrop() {
    this.selectedAvatar = this.croppedImage;
    this.showCropper = false;
    this.imageChangedEvent = null;

    if (this.croppedImage && this.userId) {
      const blob = this.base64ToBlob(this.croppedImage);
      const formData = new FormData();
      formData.append('file', blob, 'avatar.png');
      this.http
        .post<any>(`${this.baseUrl}/user-accounts/${this.userId}/avatar`, formData)
        .subscribe({
          next: (data) => {
            this.selectedAvatar = data.avatarUrl
              ? `${this.serverBaseUrl}${data.avatarUrl}`
              : this.selectedAvatar;
          },
        });
    }
  }

  private base64ToBlob(base64: string): Blob {
    const parts = base64.split(',');
    const byteString = atob(parts[1]);
    const mimeString = parts[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  cancelCrop() {
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImage = null;
  }

  abrirModalPassword() {
    this.showPasswordModal = true;
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordError = '';
    this.passwordSuccess = false;
  }

  cerrarModalPassword() {
    this.showPasswordModal = false;
  }

  cambiarPassword() {
    if (!this.userId) return;
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Las contraseñas no coinciden';
      return;
    }
    if (this.newPassword.length < 6) {
      this.passwordError = 'La nueva contraseña debe tener al menos 6 caracteres';
      return;
    }
    this.passwordError = '';
    this.cambiandoPassword = true;

    this.http
      .post(`${this.baseUrl}/user-accounts/${this.userId}/change-password`, {
        currentPassword: this.currentPassword,
        newPassword: this.newPassword,
      })
      .subscribe({
        next: () => {
          this.cambiandoPassword = false;
          this.passwordSuccess = true;
          setTimeout(() => {
            this.showPasswordModal = false;
            this.passwordSuccess = false;
          }, 1500);
        },
        error: () => {
          this.cambiandoPassword = false;
          this.passwordError = 'Contraseña actual incorrecta';
        },
      });
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
