import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  router = inject(Router);
  cdr = inject(ChangeDetectorRef);

  showNotifications = false;

  get workspaceName() {
    return typeof window !== 'undefined' ? localStorage.getItem('currentWorkspaceName') || 'Workspace' : 'Workspace';
  }

  get userName() {
    const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
    return email.split('@')[0] || 'Usuario';
  }

  get lastUpdate() {
    return 'Hace 4 minutos';
  }

  notifications = [
    { icon: 'warning', color: '#ffb4ab', title: 'Alerta de crisis detectada', desc: 'Sentimiento negativo +40%', time: 'Hace 5 min' },
    { icon: 'trending_down', color: '#c0c1ff', title: 'Reputación bajó 3 puntos', desc: 'Score bajó esta semana', time: 'Hace 1 hora' },
  ];

  hasActiveIncident = true;
  sentimentScore = 61;
  mentionsToday = 847;
  sparklinePoints = '0,35 20,30 40,32 60,20 80,25 100,15 120,18 140,10 160,15 180,8 200,12';

  activeIncidents = [
    { title: '#DeliveryLate Viralizado' },
    { title: 'Quejas por frío (App)' }
  ];

  // Selector de fuentes
  showSourceDropdown = false;
  selectedSourceIndex = 0;

  sources = [
    { name: 'Facebook', icon: 'forum', index: 64, desc: 'Menciones negativas escalando en grupos de Lima Norte' },
    { name: 'YouTube', icon: 'smart_display', index: 78, desc: 'Comentarios positivos en reseñas de producto' },
    { name: 'Twitter', icon: 'tag', index: 45, desc: 'Quejas virales sobre tiempo de espera' },
    { name: 'Instagram', icon: 'photo_camera', index: 82, desc: 'Alto engagement en contenido de marca' },
  ];

  get topSource() {
    return this.sources[this.selectedSourceIndex];
  }

  selectSource(i: number, event: Event) {
    event.stopPropagation();
    this.selectedSourceIndex = i;
    this.showSourceDropdown = false;
  }

  toggleSourceDropdown(event: Event) {
    event.stopPropagation();
    this.showSourceDropdown = !this.showSourceDropdown;
  }

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const wsId = localStorage.getItem('currentWorkspaceId');
      if (!wsId) {
        this.router.navigate(['/home']);
      }
    }
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  goToSection(section: string) {
    this.router.navigate([`/dashboard/${section}`]);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
