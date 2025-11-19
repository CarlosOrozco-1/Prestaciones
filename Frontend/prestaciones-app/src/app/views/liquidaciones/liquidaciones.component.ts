import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  PrestacionesApiService,
  Empleado,
  CalcularLiquidacionRequest,
  CalcularLiquidacionResponse,
  LiquidacionResultado
} from '../../services/prestaciones-api.service';

@Component({
  selector: 'app-liquidaciones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './liquidaciones.component.html',
  styleUrls: ['./liquidaciones.component.css'],
})
export class LiquidacionesComponent implements OnInit {

  empleados: Empleado[] = [];
  empleadoSeleccionado?: Empleado;

  loadingEmpleados = false;
  loadingCalculo = false;

  errorMessage = '';
  successMessage = '';

  resultado?: LiquidacionResultado;
  
  // Formulario con tipado correcto
  liquidacionForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private api: PrestacionesApiService
  ) {
    // Inicialización del formulario en el constructor
    this.liquidacionForm = this.fb.group({
      idEmpleado: [null as number | null, [Validators.required]],
      fechaEgreso: ['', [Validators.required]],   // string de input type="date"
    });
  }

  ngOnInit(): void {
    this.cargarEmpleados();
    this.setupFormSubscriptions();
  }

  // ============================
  // CONFIGURACIÓN DEL FORMULARIO
  // ============================
  setupFormSubscriptions(): void {
    // Cuando se selecciona un empleado, cargar sus datos
    this.liquidacionForm.get('idEmpleado')?.valueChanges.subscribe(idEmpleado => {
      if (idEmpleado) {
        this.empleadoSeleccionado = this.empleados.find(emp => emp.idEmpleado === Number(idEmpleado));
      } else {
        this.empleadoSeleccionado = undefined;
      }
    });
  }

  // ============================
  // CARGAR LISTA DE EMPLEADOS
  // ============================
  cargarEmpleados(): void {
    this.loadingEmpleados = true;
    this.errorMessage = '';
    
    this.api.listEmpleados().subscribe({
      next: (data) => {
        // Filtrar solo empleados activos
        this.empleados = data.filter(emp => emp.estado === 'ACTIVO');
        this.loadingEmpleados = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error al cargar la lista de empleados.';
        this.loadingEmpleados = false;
      }
    });
  }

  // ============================
  // CALCULAR LIQUIDACIÓN
  // ============================
  onSubmit(): void {
    this.clearMessages();
    this.resultado = undefined;

    if (this.liquidacionForm.invalid) {
      this.errorMessage = 'Por favor selecciona un colaborador y una fecha de egreso.';
      this.liquidacionForm.markAllAsTouched();
      return;
    }

    const formData = this.liquidacionForm.value;

    // Validación adicional de fecha
    const fechaEgreso = new Date(formData.fechaEgreso);
    if (this.empleadoSeleccionado) {
      const fechaIngreso = new Date(this.empleadoSeleccionado.fechaIngreso);
      if (fechaEgreso <= fechaIngreso) {
        this.errorMessage = 'La fecha de egreso debe ser posterior a la fecha de ingreso.';
        return;
      }
    }

    const request: CalcularLiquidacionRequest = {
      idEmpleado: Number(formData.idEmpleado),
      fechaEgreso: fechaEgreso.toISOString()
    };

    this.loadingCalculo = true;

    this.api.calcularLiquidacion(request).subscribe({
      next: (response: CalcularLiquidacionResponse) => {
        this.loadingCalculo = false;
        this.successMessage = response.message || 'Liquidación calculada exitosamente';
        this.resultado = response.data;
      },
      error: (err) => {
        console.error(err);
        this.loadingCalculo = false;
        this.errorMessage = 'Ocurrió un error al calcular la liquidación.';
      }
    });
  }

  // ============================
  // MÉTODOS AUXILIARES
  // ============================
  limpiarFormulario(): void {
    this.liquidacionForm.reset();
    this.empleadoSeleccionado = undefined;
    this.resultado = undefined;
    this.clearMessages();
  }

  nuevaLiquidacion(): void {
    this.limpiarFormulario();
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  hasError(controlName: string, error: string): boolean {
    const ctrl = this.liquidacionForm.get(controlName);
    return !!ctrl && ctrl.touched && ctrl.hasError(error);
  }

  // ============================
  // MÉTODOS DE FORMATEO
  // ============================
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount || 0);
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-GT');
  }

  calcularDiasRelacion(): number {
    if (!this.empleadoSeleccionado || !this.liquidacionForm.value.fechaEgreso) {
      return 0;
    }
    
    const fechaIngreso = new Date(this.empleadoSeleccionado.fechaIngreso);
    const fechaEgreso = new Date(this.liquidacionForm.value.fechaEgreso);
    
    const diffTime = Math.abs(fechaEgreso.getTime() - fechaIngreso.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  }

  // ============================
  // GETTERS PARA TEMPLATE
  // ============================
  get empleadoActual(): Empleado | undefined {
    return this.empleadoSeleccionado;
  }

  get tieneResultado(): boolean {
    return !!this.resultado;
  }

  get isFormValid(): boolean {
    return this.liquidacionForm.valid;
  }
}
