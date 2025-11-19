import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environments';

export interface HistorialLiquidacion {
  idLiquidacion: number;
  idEmpleado: number;
  nombreCompleto: string;
  fechaCalculo: string;
  fechaEgreso: string;
  diasRelacion: number;
  salarioDevengado: number;
  indemnizacion: number;
  vacaciones: number;
  aguinaldo: number;
  bono14: number;
  ventajasEconomicas: number;
  totalPagar: number;
}

@Injectable({
  providedIn: 'root'
})
export class LiquidacionesService {
  private apiUrl = `${environment.apiBaseUrl}/api/liquidaciones`;

  constructor(private http: HttpClient) { }

  // Obtener historial completo de todas las liquidaciones
  getHistorial(): Observable<HistorialLiquidacion[]> {
    return this.http.get<HistorialLiquidacion[]>(`${this.apiUrl}/historial`);
  }

  // Obtener historial de liquidaciones por empleado
  getHistorialPorEmpleado(idEmpleado: number): Observable<HistorialLiquidacion[]> {
    return this.http.get<HistorialLiquidacion[]>(`${this.apiUrl}/historial/${idEmpleado}`);
  }
}
