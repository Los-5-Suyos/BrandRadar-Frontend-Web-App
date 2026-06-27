import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, ImageCropperComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent {
  router = inject(Router);

  fullName = '';
  bio = '';
  language = 'ES';
  timezone = 'GMT-5';
  emailNotifications = true;
  selectedAvatar: string | null = null;
  showCropper = false;
  imageChangedEvent: Event | null = null;
  croppedImage: string | null = null;

  get userName() {
    const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
    return email.split('@')[0] || 'Usuario';
  }

  get userEmail() {
    return typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
  }

  get workspaceName() {
    return typeof window !== 'undefined' ? localStorage.getItem('currentWorkspaceName') || 'Workspace' : 'Workspace';
  }

  onAvatarSelected(event: Event) {
    this.imageChangedEvent = event;
    this.showCropper = true;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64 ?? null;
  }

  applyCrop() {
    this.selectedAvatar = this.croppedImage;
    this.showCropper = false;
    this.imageChangedEvent = null;
  }

  cancelCrop() {
    this.showCropper = false;
    this.imageChangedEvent = null;
    this.croppedImage = null;
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
