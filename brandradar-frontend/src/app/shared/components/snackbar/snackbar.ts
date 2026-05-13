import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-snackbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './snackbar.html', // Referencia al archivo HTML en la misma carpeta
  styleUrl: './snackbar.css', // Referencia al archivo CSS en la misma carpeta
})
export class SnackbarComponent {
  message: string = '';
  isVisible: boolean = false;
  isError: boolean = false;

  // Método para mostrar el mensaje (lo usará el equipo en el Login o Dashboard)
  show(msg: string, error: boolean = false) {
    this.message = msg;
    this.isError = error;
    this.isVisible = true;

    // El mensaje desaparece solito tras 3 segundos
    setTimeout(() => this.close(), 3000);
  }

  close() {
    this.isVisible = false;
  }
}
