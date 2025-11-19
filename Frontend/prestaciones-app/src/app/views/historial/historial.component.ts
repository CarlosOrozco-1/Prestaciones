import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiquidacionesService, HistorialLiquidacion } from '../../services/liquidaciones.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-historial',
  imports: [CommonModule, FormsModule],
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.css'
})
export class HistorialComponent implements OnInit {
  historial: HistorialLiquidacion[] = [];
  historialFiltrado: HistorialLiquidacion[] = [];
  loading: boolean = false;
  error: string = '';
  searchTerm: string = '';
  liquidacionSeleccionada: HistorialLiquidacion | null = null;

  constructor(private liquidacionesService: LiquidacionesService) { }

  ngOnInit(): void {
    this.cargarHistorial();
  }

  cargarHistorial(): void {
    this.loading = true;
    this.error = '';
    
    this.liquidacionesService.getHistorial().subscribe({
      next: (data) => {
        this.historial = data;
        this.historialFiltrado = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Error al cargar el historial de liquidaciones';
        this.loading = false;
        console.error(err);
      }
    });
  }

  filtrarHistorial(): void {
    const term = this.searchTerm.toLowerCase();
    this.historialFiltrado = this.historial.filter(item => 
      item.nombreCompleto.toLowerCase().includes(term) ||
      item.idEmpleado.toString().includes(term) ||
      item.idLiquidacion.toString().includes(term)
    );
  }

  verDetalle(liquidacion: HistorialLiquidacion): void {
    this.liquidacionSeleccionada = liquidacion;
  }

  cerrarDetalle(): void {
    this.liquidacionSeleccionada = null;
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(value);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
