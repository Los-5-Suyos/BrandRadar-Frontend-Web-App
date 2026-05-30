import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth.service';
import { WorkspaceService } from '../../../../../core/services/workspace.service';

interface Brand { id: string; name: string; reputationScore: number; isActive: boolean; }
interface Mention { id: string; brandId: string; content: string; sentimentType: string; criticidad: number; timestamp?: string; }
interface Alert { id: string; brandId: string; severityLevel: string; status: string; message: string; }
interface Incident { id: string; brandId: string; status: string; createdAt: string; title: string; }

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private readonly API = 'http://localhost:3000';

  brands = signal<Brand[]>([]);
  mentions = signal<Mention[]>([]);
  alerts = signal<Alert[]>([]);
  incidents = signal<Incident[]>([]);
  loading = signal(true);
  sentimentFilter = signal<string>('TODOS');
  activeSection = signal<string>('dashboard');

  positiveCount = computed(() => this.mentions().filter(m => m.sentimentType === 'POSITIVO').length);
  negativeCount = computed(() => this.mentions().filter(m => m.sentimentType === 'NEGATIVO').length);
  neutralCount = computed(() => this.mentions().filter(m => m.sentimentType === 'NEUTRO').length);

  positiveDash = computed(() => Math.round((this.positiveCount() / (this.mentions().length || 1)) * 283));
  neutralDash = computed(() => Math.round((this.neutralCount() / (this.mentions().length || 1)) * 283));
  negativeDash = computed(() => Math.round((this.negativeCount() / (this.mentions().length || 1)) * 283));

  filteredMentions = computed(() => {
    const f = this.sentimentFilter();
    if (f === 'TODOS') return this.mentions();
    return this.mentions().filter(m => m.sentimentType === f);
  });

  mainBrand = computed(() => this.brands()[0] || null);

  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private ws: WorkspaceService,
    private router: Router
  ) {}

  ngOnInit() {
    Promise.all([
      this.http.get<Brand[]>(`${this.API}/brands`).toPromise(),
      this.http.get<Mention[]>(`${this.API}/mentions`).toPromise(),
      this.http.get<Alert[]>(`${this.API}/alerts`).toPromise(),
      this.http.get<Incident[]>(`${this.API}/incidents`).toPromise(),
    ]).then(([brands, mentions, alerts, incidents]) => {
      this.brands.set(brands || []);
      this.mentions.set(mentions || []);
      this.alerts.set(alerts || []);
      this.incidents.set(incidents || []);
      this.loading.set(false);
    }).catch(() => this.loading.set(false));
  }

  setFilter(f: string) { this.sentimentFilter.set(f); }
  setSection(s: string) { this.activeSection.set(s); }
  logout() { this.auth.logout(); }

  get user() { return this.auth.currentUser(); }
  get workspace() { return this.ws.selectedWorkspace(); }

  getSentimentClass(type: string): string {
    if (type === 'POSITIVO') return 'positive';
    if (type === 'NEGATIVO') return 'negative';
    return 'neutral';
  }

  getSeverityClass(level: string): string {
    if (level === 'HIGH') return 'high';
    if (level === 'MEDIUM') return 'medium';
    return 'low';
  }
}
