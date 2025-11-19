import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './liquidaciones.component.html',
  styleUrls: ['./liquidaciones.component.css'],
})
export class LiquidacionesComponent implements OnInit {

  empleados: Empleado[] = [];

  loadingEmpleados = false;
  loadingCalculo = false;

  errorMessage = '';
  successMessage = '';

  resultado?: LiquidacionResultado;
  
  form: any;

  constructor(
    private fb: FormBuilder,
    private api: PrestacionesApiService
  ) {
    this.form = this.fb.group({
      idEmpleado: [null as number | null, [Validators.required]],
      fechaEgreso: ['', [Validators.required]],   // string de input type="date"
    });
  }

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  // ============================
  // Cargar lista de empleados
  // ============================
  cargarEmpleados(): void {
    this.loadingEmpleados = true;
    this.errorMessage = '';
    this.api.listEmpleados().subscribe({
      next: (data) => {
        this.empleados = data;
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
  // Calcular liquidación
  // ============================
  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';
    this.resultado = undefined;

    if (this.form.invalid) {
      this.errorMessage = 'Por favor selecciona un colaborador y una fecha de egreso.';
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.value;

    const fechaEgresoIso = raw.fechaEgreso
      ? new Date(raw.fechaEgreso).toISOString()
      : '';

    const body: CalcularLiquidacionRequest = {
      idEmpleado: Number(raw.idEmpleado),
      fechaEgreso: fechaEgresoIso
    };

    this.loadingCalculo = true;

    this.api.calcularLiquidacion(body).subscribe({
      next: (res: CalcularLiquidacionResponse) => {
        this.loadingCalculo = false;
        this.successMessage = res.message;
        this.resultado = res.data;
      },
      error: (err) => {
        console.error(err);
        this.loadingCalculo = false;
        this.errorMessage = 'Ocurrió un error al calcular la liquidación.';
      }
    });
  }

  hasError(controlName: string, error: string): boolean {
    const ctrl = this.form.get(controlName);
    return !!ctrl && ctrl.touched && ctrl.hasError(error);
  }
}
