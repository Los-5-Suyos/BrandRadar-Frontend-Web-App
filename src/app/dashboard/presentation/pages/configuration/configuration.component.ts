import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface OpcionIndustria {
  value: string;
  label: string;
}

interface CanalAnalisis {
  key: string;
  nombre: string;
  logo?: string;
  icono?: string; // material icon, usado cuando no hay logo de marca (ej. Blogs/Web)
  estado: 'activo' | 'bloqueado';
}

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css'
})
export class ConfigurationComponent {
  router = inject(Router);

  get workspaceName() {
    return typeof window !== 'undefined' ? localStorage.getItem('currentWorkspaceName') || 'Workspace' : 'Workspace';
  }

  get planLabel(): string {
    const plan = typeof window !== 'undefined' ? localStorage.getItem('workspacePlan') || 'FREE' : 'FREE';
    if (plan === 'PRO') return 'Pro';
    if (plan === 'ENTERPRISE') return 'Enterprise';
    return 'Basic';
  }

  // ===== Logo de la marca =====
  logoUrl: string | null = null;

  onLogoSeleccionado(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { this.logoUrl = reader.result as string; };
    reader.readAsDataURL(file);
    // TODO: subir el archivo real al backend / storage
  }

  quitarLogo() {
    this.logoUrl = null;
  }

  // ===== Información general =====
  nombreEmpresa = 'Bembos S.A.C.';
  nombreWorkspace = 'Bembos Express';

  industrias: OpcionIndustria[] = [
    { value: 'gastronomia', label: 'Gastronomía / F&B' },
    { value: 'tecnologia', label: 'Tecnología' },
    { value: 'retail', label: 'Retail' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'educacion', label: 'Educación' },
    { value: 'salud', label: 'Salud' },
  ];
  industriaSeleccionada = 'gastronomia';

  // ===== Reglas de monitoreo =====
  keywordsInclusion: string[] = ['Bembos', 'Hamburguesas', 'Delivery'];
  keywordsExclusion: string[] = ['Trabajo', 'Empleo'];

  nuevaKeywordInclusion = '';
  nuevaKeywordExclusion = '';

  agregarKeyword(tipo: 'inclusion' | 'exclusion') {
    if (tipo === 'inclusion') {
      const valor = this.nuevaKeywordInclusion.trim();
      if (valor && !this.keywordsInclusion.includes(valor)) {
        this.keywordsInclusion.push(valor);
      }
      this.nuevaKeywordInclusion = '';
    } else {
      const valor = this.nuevaKeywordExclusion.trim();
      if (valor && !this.keywordsExclusion.includes(valor)) {
        this.keywordsExclusion.push(valor);
      }
      this.nuevaKeywordExclusion = '';
    }
  }

  quitarKeyword(tipo: 'inclusion' | 'exclusion', index: number) {
    if (tipo === 'inclusion') {
      this.keywordsInclusion.splice(index, 1);
    } else {
      this.keywordsExclusion.splice(index, 1);
    }
  }

  // ===== Canales digitales (fuentes propias) =====
  paginaWeb = 'https://www.bembos.com.pe';
  canalYoutube = 'https://youtube.com/@bembosoficial';

  // ===== Canales de análisis (fuentes de monitoreo) =====
  canalesAnalisis: CanalAnalisis[] = [
    { key: 'youtube', nombre: 'YouTube', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg', estado: 'activo' },
    { key: 'facebook', nombre: 'Facebook', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg', estado: 'bloqueado' },
    { key: 'twitter', nombre: 'Twitter / X', logo: 'https://img.logo.dev/x.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true', estado: 'bloqueado' },
    { key: 'tiktok', nombre: 'TikTok', logo: 'https://img.magnific.com/vector-premium/logotipo-tik-tok_578229-290.jpg?semt=ais_hybrid&w=740&q=80', estado: 'bloqueado' },
    { key: 'instagram', nombre: 'Instagram', logo: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Instagram_icon.png', estado: 'bloqueado' },
    { key: 'google_news', nombre: 'Google News', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Google_News_icon.svg/960px-Google_News_icon.svg.png', estado: 'bloqueado' },
    { key: 'reddit', nombre: 'Reddit', logo: 'https://img.logo.dev/reddit.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true', estado: 'bloqueado' },
    { key: 'blogs', nombre: 'Blogs / Web', icono: 'article', estado: 'bloqueado' },
  ];

  solicitarUpgrade(canal: CanalAnalisis) {
    // TODO: navegar al flujo de upgrade de plan (subscription/payment)
    this.router.navigate(['/subscription']);
  }

  guardando = false;

  guardarCambios() {
    this.guardando = true;
    // TODO: persistir cambios de configuración en el backend
    setTimeout(() => { this.guardando = false; }, 1200);
  }

  goToSection(section: string) {
    this.router.navigate([`/${section}`]);
  }

  goHome() {
    this.router.navigate(['/home']);
  }
}
