import { Component, inject, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-loading',
  standalone: true,
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.css'
})
export class LoadingComponent implements OnInit {
  router = inject(Router);
  route = inject(ActivatedRoute);

  loadingText = 'Cargando...';

  ngOnInit() {
    const redirect = this.route.snapshot.queryParamMap.get('redirect') || 'home';

    if (redirect === 'dashboard') {
      this.loadingText = 'Cargando tu workspace...';
    } else if (redirect === 'home') {
      this.loadingText = 'Iniciando sesión...';
    }

    setTimeout(() => {
      this.router.navigate([`/${redirect}`]);
    }, 1800);
  }
}
