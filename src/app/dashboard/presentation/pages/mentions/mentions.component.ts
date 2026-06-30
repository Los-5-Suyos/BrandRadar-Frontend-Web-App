import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-mentions',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './mentions.component.html',
  styleUrl: './mentions.component.css'
})
export class MentionsComponent {
  router = inject(Router);

  get workspaceName() {
    return typeof window !== 'undefined' ? localStorage.getItem('currentWorkspaceName') || 'Workspace' : 'Workspace';
  }

  get userName() {
    const email = typeof window !== 'undefined' ? localStorage.getItem('userEmail') || '' : '';
    return email.split('@')[0] || 'Usuario';
  }

  get planLabel(): string {
    const plan = typeof window !== 'undefined' ? localStorage.getItem('workspacePlan') || 'FREE' : 'FREE';
    if (plan === 'PRO') return 'PRO';
    if (plan === 'ENTERPRISE') return 'ENTERPRISE';
    return 'BÁSICO';
  }

  get userRole(): string {
    return typeof window !== 'undefined' ? localStorage.getItem('userRole') || 'PYME' : 'PYME';
  }

  activeFilter = 'todos';
  searchQuery = '';
  selectedMencion: any = null;
  showModal = false;
  loadingAI = false;
  aiResponse: any = null;

  filters = ['todos', 'negativo', 'neutro', 'positivo'];

  menciones = [
    {
      id: 1, initials: 'RT', color: '#3b3f8c',
      usuario: 'Ricardo Torres', handle: '@ricardo_t_peru',
      plataforma: 'Twitter/X', plataformaIcon: 'https://img.logo.dev/x.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true',
      tiempo: 'hace 2 min',
      texto: 'Increíble que pidas un combo y el delivery tarde más de 1 hora. La hamburguesa llegó helada. ¿Qué pasó con la calidad? #BembosExpress #MalServicio',
      keywords: ['delivery', 'helada'],
      score: 0.88, sentimiento: 'NEGATIVO', sentimientoColor: '#ffb4ab',
      url: 'https://x.com'
    },
    {
      id: 2, initials: 'MQ', color: '#5c1a3f',
      usuario: 'María Quispe', handle: 'Facebook User',
      plataforma: 'Facebook', plataformaIcon: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
      tiempo: 'hace 15 min',
      texto: 'Nuevamente Bembos de Larcomar me falla. Mucha demora en el local y el repartidor se perdió. Mi pedido llegó todo frío y mal empacado. No vuelvo a pedir.',
      keywords: ['demora', 'frío'],
      score: 0.94, sentimiento: 'NEGATIVO', sentimientoColor: '#ffb4ab',
      url: 'https://facebook.com'
    },
    {
      id: 3, initials: 'JG', color: '#1a5c3f',
      usuario: 'Jorge García', handle: '@jorge_delivery_blog',
      plataforma: 'TikTok', plataformaIcon: 'https://img.magnific.com/vector-premium/logotipo-tik-tok_578229-290.jpg?semt=ais_hybrid&w=740&q=80',
      tiempo: 'hace 28 min',
      texto: 'Probando la nueva hamburguesa extrema de Bembos. El sabor está ok, pero el delivery me cobró extra sin aviso previo. #FoodVlog #Peru',
      keywords: ['delivery'],
      score: 0.42, sentimiento: 'NEUTRO', sentimientoColor: '#f97316',
      url: 'https://tiktok.com'
    },
    {
      id: 4, initials: 'AN', color: '#7c3f1a',
      usuario: 'Ana Navarro', handle: 'Google Reviews',
      plataforma: 'Google News', plataformaIcon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Google_News_icon.svg/960px-Google_News_icon.svg.png',
      tiempo: 'hace 45 min',
      texto: 'Pésimo. Demasiada demora para un local que se supone es "express". El personal no sabía ni qué pedido era el mío.',
      keywords: ['demora'],
      score: 0.91, sentimiento: 'NEGATIVO', sentimientoColor: '#ffb4ab',
      url: 'https://google.com'
    },
    {
      id: 5, initials: 'LP', color: '#3b3f8c',
      usuario: 'Luis Peralta', handle: '@luisperalta99',
      plataforma: 'Twitter/X', plataformaIcon: 'https://img.logo.dev/x.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true',
      tiempo: 'hace 1 hora',
      texto: 'Bembos sigue siendo mi favorito. El nuevo local de Surco está limpio y el servicio fue rápido. ¡Recomendado!',
      keywords: [],
      score: 0.12, sentimiento: 'POSITIVO', sentimientoColor: '#63f7ff',
      url: 'https://x.com'
    },
  ];
  activeMainTab = 'menciones';

  workspaceKeywords = ['delivery', 'demora', 'frío', 'Bembos', 'empaque'];

  publicaciones = [
    {
      id: 1,
      plataforma: 'YouTube',
      plataformaIcon: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
      usuario: 'FoodVlog Peru',
      tiempo: 'hace 1 hora',
      keyword: 'delivery',
      texto: 'Probé el delivery de Bembos Express en Miraflores y la experiencia fue terrible. El pedido llegó 45 minutos tarde y frío.',
      likes: 1240,
      comentarios: 89,
      url: 'https://youtube.com'
    },
    {
      id: 2,
      plataforma: 'Twitter/X',
      plataformaIcon: 'https://img.logo.dev/x.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true',
      usuario: '@gastronomia_pe',
      tiempo: 'hace 2 horas',
      keyword: 'demora',
      texto: 'Hilo sobre las demoras en fastfood peruano. Bembos Express encabeza las quejas esta semana con más de 200 menciones negativas.',
      likes: 432,
      comentarios: 67,
      url: 'https://x.com'
    },
    {
      id: 3,
      plataforma: 'Reddit',
      plataformaIcon: 'https://img.logo.dev/reddit.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true',
      usuario: 'u/lima_foodie',
      tiempo: 'hace 3 horas',
      keyword: 'frío',
      texto: 'r/Lima — ¿Alguien más ha tenido problemas con el empaque de Bembos? Mi pedido llegó todo frío y aplastado. Parece un problema sistemático.',
      likes: 287,
      comentarios: 43,
      url: 'https://reddit.com'
    },
    {
      id: 4,
      plataforma: 'YouTube',
      plataformaIcon: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg',
      usuario: 'DeliveryReviews PE',
      tiempo: 'hace 5 horas',
      keyword: 'Bembos',
      texto: 'Top 5 peores experiencias de delivery en Lima 2026 — Bembos Express aparece en el puesto 2 por sus tiempos de entrega.',
      likes: 3400,
      comentarios: 210,
      url: 'https://youtube.com'
    },
    {
      id: 5,
      plataforma: 'Twitter/X',
      plataformaIcon: 'https://img.logo.dev/x.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true',
      usuario: '@consumidor_pe',
      tiempo: 'hace 6 horas',
      keyword: 'empaque',
      texto: 'El empaque de Bembos es un desastre. Las papas llegan aplastadas y la bolsa siempre está mojada. ¿Cuándo van a mejorar esto?',
      likes: 156,
      comentarios: 28,
      url: 'https://x.com'
    },
  ];

  activeChannel = 'todos';

  availableChannels = [
    { name: 'Facebook', logo: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg', count: 423 },
    { name: 'Twitter/X', logo: 'https://img.logo.dev/x.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true', count: 312 },
    { name: 'TikTok', logo: 'https://img.magnific.com/vector-premium/logotipo-tik-tok_578229-290.jpg?semt=ais_hybrid&w=740&q=80', count: 245 },
    { name: 'Reddit', logo: 'https://img.logo.dev/reddit.com?token=pk_XE_XBDKdRaGuZ8ro3WCxIQ&size=140&retina=true', count: 89 },
    { name: 'Google News', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/da/Google_News_icon.svg/960px-Google_News_icon.svg.png', count: 45 },
    { name: 'YouTube', logo: 'https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg', count: 32 },
  ];

  get filteredMenciones() {
    return this.menciones.filter(m => {
      const matchFilter = this.activeFilter === 'todos' || m.sentimiento.toLowerCase() === this.activeFilter;
      const matchChannel = this.activeChannel === 'todos' || m.plataforma === this.activeChannel;
      const matchSearch = !this.searchQuery || m.texto.toLowerCase().includes(this.searchQuery.toLowerCase()) || m.usuario.toLowerCase().includes(this.searchQuery.toLowerCase());
      return matchFilter && matchChannel && matchSearch;
    });
  }

  highlightText(texto: string, keywords: string[]): string {
    if (!keywords.length) return texto;
    let result = texto;
    keywords.forEach(kw => {
      const regex = new RegExp(`(${kw})`, 'gi');
      result = result.replace(regex, '<mark class="kw-highlight">$1</mark>');
    });
    return result;
  }

  openModal(m: any) {
    this.selectedMencion = m;
    this.showModal = true;
    this.aiResponse = null;
    this.generateAI(m);
  }

  closeModal() {
    this.showModal = false;
    this.selectedMencion = null;
    this.aiResponse = null;
  }

  async generateAI(mencion: any) {
    this.loadingAI = true;
    const role = this.userRole === 'AGENCIA' ? 'agencia de marketing' : 'pequeña empresa (PYME)';
    const prompt = `Eres un consultor de reputación digital para una ${role}.
  Se detectó la siguiente mención en ${mencion.plataforma}:
  "${mencion.texto}"
  Score de sentimiento negativo: ${mencion.score}

Responde SOLO en JSON con este formato exacto:
{
  "analisis": "análisis breve del problema en 2 oraciones",
  "estrategia": "estrategia recomendada en 2 oraciones",
  "borrador": "borrador de respuesta pública lista para copiar y pegar",
  "accion": "Crear Incidente o Marcar como Atendida"
}`;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.groqKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 500,
          temperature: 0.7
        })
      });
      const data = await response.json();
      const text = data.choices[0].message.content;
      const clean = text.replace(/```json|```/g, '').trim();
      this.aiResponse = JSON.parse(clean);
    } catch (e) {
      this.aiResponse = {
        analisis: 'No se pudo generar el análisis automático.',
        estrategia: 'Revisa la mención manualmente y toma acción.',
        borrador: 'Gracias por tu comentario. Estamos trabajando para mejorar tu experiencia.',
        accion: 'Crear Incidente'
      };
    }
    this.loadingAI = false;
  }

  readonly groqKey = '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';

  copyText(text: string) {
    navigator.clipboard.writeText(text);
  }

  goToSection(section: string) {
    this.router.navigate([`/${section}`]);
  }

  goHome() {
    this.router.navigate(['/home']);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
}
