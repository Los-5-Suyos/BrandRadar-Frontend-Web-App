import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MonitoringService } from '../../../../../core/services/monitoring';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
})
export class DashboardComponent implements OnInit {
  mentions: any[] = [];
  errorMessage: string = '';
  isLoading: boolean = true;
  filtroActual: string = '';

  constructor(
    private monitoringService: MonitoringService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.cargarDatos('');
  }

  cargarDatos(sentimiento: string): void {
    this.filtroActual = sentimiento;

    this.monitoringService.getMentionsWithPolling('b-001', this.filtroActual).subscribe({
      next: (data) => {
        // PASO 4: Ordenar por criticidad (Negativos primero)
        this.mentions = this.ordenarPorCriticidad([...data]);

        this.isLoading = false;
        // PASO 4: Retornar mensaje específico si no hay resultados
        this.errorMessage = this.mentions.length === 0 ? 'SIN_INCIDENTES_EN_CATEGORÍA' : '';

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'ERROR_DE_CONEXIÓN_API';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // PASO 4: Lógica de ordenamiento
  private ordenarPorCriticidad(lista: any[]): any[] {
    const orden: any = { NEGATIVO: 1, NEUTRO: 2, POSITIVO: 3 };
    return lista.sort((a, b) => orden[a.sentimentType] - orden[b.sentimentType]);
  }

  filtrar(sentimiento: string) {
    this.cargarDatos(sentimiento);
  }
}
