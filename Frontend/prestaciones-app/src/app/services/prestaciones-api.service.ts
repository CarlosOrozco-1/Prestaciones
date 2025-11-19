import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environments';
import { Observable } from 'rxjs';

// === Interfaces de apoyo ===
export interface Empleado {
  idEmpleado: number;
  dpi: string;
  nombres: string;
  apellidos: string;
  fechaIngreso: string;   // ISO string
  fechaEgreso?: string | null;
  salarioBase: number;
  promComisiones?: number | null;
  bonoIncentivo?: number | null;
  estado: string;
}

export interface CreateEmpleadoRequest {
  dpi: string;
  nombres: string;
  apellidos: string;
  fechaIngreso: string;   // ISO string (ej: '2025-11-18T00:00:00')
  salarioBase: number;
  promComisiones?: number | null;
  bonoIncentivo?: number | null;
}

export interface CreateEmpleadoResponse {
  id: number;
  message: string;
}

export interface CalcularLiquidacionRequest {
  idEmpleado: number;
  fechaEgreso: string;   // ISO string
}

export interface LiquidacionResultado {
  idLiquidacion: number;
  idEmpleado: number;
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

export interface CalcularLiquidacionResponse {
  message: string;
  data: LiquidacionResultado;
}

@Injectable({
  providedIn: 'root'
})
export class PrestacionesApiService {
  private baseUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // ==============================
  // EMPLEADOS
  // ==============================

  listEmpleados(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(`${this.baseUrl}/api/empleados`);
  }

  getEmpleado(id: number): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.baseUrl}/api/empleados/${id}`);
  }

  createEmpleado(body: CreateEmpleadoRequest): Observable<CreateEmpleadoResponse> {
    return this.http.post<CreateEmpleadoResponse>(`${this.baseUrl}/api/empleados`, body);
  }

  // ==============================
  // LIQUIDACIONES
  // ==============================

  calcularLiquidacion(body: CalcularLiquidacionRequest): Observable<CalcularLiquidacionResponse> {
    return this.http.post<CalcularLiquidacionResponse>(
      `${this.baseUrl}/api/liquidaciones/calcular`,
      body
    );
  }
}
