import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  PrestacionesApiService,
  Empleado,
  CreateEmpleadoRequest,
  UpdateEmpleadoRequest
} from '../../services/prestaciones-api.service';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css'],
})
export class EmpleadosComponent implements OnInit {

  empleados: Empleado[] = [];
  loading = false;
  errorMessage = '';
  successMessage = '';

  // Estados del formulario
  showForm = false;
  editMode = false;
  currentEmpleadoId: number | null = null;

  // Formulario reactivo
  empleadoForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private api: PrestacionesApiService
  ) {
    // Inicialización del formulario en el constructor
    this.empleadoForm = this.fb.group({
      dpi: ['', [Validators.required, Validators.minLength(13)]],
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      fechaIngreso: ['', [Validators.required]],
      fechaEgreso: [''],
      salarioBase: [0, [Validators.required, Validators.min(0.01)]],
      promComisiones: [0],
      bonoIncentivo: [0],
      estado: ['ACTIVO', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  // ============================
  // CARGAR EMPLEADOS
  // ============================
  cargarEmpleados(): void {
    this.loading = true;
    this.errorMessage = '';

    this.api.listEmpleados().subscribe({
      next: (data) => {
        this.empleados = data;
        this.loading = false;
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Error al cargar empleados.';
        this.loading = false;
      }
    });
  }

  // ============================
  // MOSTRAR/OCULTAR FORMULARIO
  // ============================
  mostrarFormularioNuevo(): void {
    this.editMode = false;
    this.currentEmpleadoId = null;
    this.showForm = true;
    this.resetForm();
    this.clearMessages();
  }

  mostrarFormularioEditar(empleado: Empleado): void {
    this.editMode = true;
    this.currentEmpleadoId = empleado.idEmpleado;
    this.showForm = true;
    this.cargarDatosEnFormulario(empleado);
    this.clearMessages();
  }

  ocultarFormulario(): void {
    this.showForm = false;
    this.editMode = false;
    this.currentEmpleadoId = null;
    this.resetForm();
    this.clearMessages();
  }

  // ============================
  // CREAR EMPLEADO
  // ============================
  onSubmit(): void {
    if (this.empleadoForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos obligatorios.';
      this.empleadoForm.markAllAsTouched();
      return;
    }

    if (this.editMode) {
      this.actualizarEmpleado();
    } else {
      this.crearEmpleado();
    }
  }

  crearEmpleado(): void {
    const formData = this.empleadoForm.value;
    
    const request: CreateEmpleadoRequest = {
      dpi: formData.dpi,
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      fechaIngreso: new Date(formData.fechaIngreso).toISOString(),
      salarioBase: Number(formData.salarioBase),
      promComisiones: formData.promComisiones ? Number(formData.promComisiones) : null,
      bonoIncentivo: formData.bonoIncentivo ? Number(formData.bonoIncentivo) : null
    };

    this.loading = true;
    this.clearMessages();

    this.api.createEmpleado(request).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Empleado creado exitosamente.';
        this.cargarEmpleados();
        this.ocultarFormulario();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'Error al crear empleado.';
      }
    });
  }

  // ============================
  // ACTUALIZAR EMPLEADO
  // ============================
  actualizarEmpleado(): void {
    if (!this.currentEmpleadoId) return;

    const formData = this.empleadoForm.value;
    
    const request: UpdateEmpleadoRequest = {
      dpi: formData.dpi,
      nombres: formData.nombres,
      apellidos: formData.apellidos,
      fechaIngreso: new Date(formData.fechaIngreso).toISOString(),
      fechaEgreso: formData.fechaEgreso ? new Date(formData.fechaEgreso).toISOString() : null,
      salarioBase: Number(formData.salarioBase),
      promComisiones: formData.promComisiones ? Number(formData.promComisiones) : null,
      bonoIncentivo: formData.bonoIncentivo ? Number(formData.bonoIncentivo) : null,
      estado: formData.estado
    };

    this.loading = true;
    this.clearMessages();

    this.api.updateEmpleado(this.currentEmpleadoId, request).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Empleado actualizado exitosamente.';
        this.cargarEmpleados();
        this.ocultarFormulario();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'Error al actualizar empleado.';
      }
    });
  }

  // ============================
  // ELIMINAR EMPLEADO
  // ============================
  eliminarEmpleado(empleado: Empleado): void {
    if (!confirm(`¿Está seguro de eliminar a ${empleado.nombres} ${empleado.apellidos}?`)) {
      return;
    }

    this.loading = true;
    this.clearMessages();

    this.api.deleteEmpleado(empleado.idEmpleado).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage = 'Empleado eliminado exitosamente.';
        this.cargarEmpleados();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        this.errorMessage = 'Error al eliminar empleado.';
      }
    });
  }

  // ============================
  // MÉTODOS AUXILIARES
  // ============================
  cargarDatosEnFormulario(empleado: Empleado): void {
    const fechaIngreso = empleado.fechaIngreso ? new Date(empleado.fechaIngreso).toISOString().split('T')[0] : '';
    const fechaEgreso = empleado.fechaEgreso ? new Date(empleado.fechaEgreso).toISOString().split('T')[0] : '';

    this.empleadoForm.patchValue({
      dpi: empleado.dpi,
      nombres: empleado.nombres,
      apellidos: empleado.apellidos,
      fechaIngreso: fechaIngreso,
      fechaEgreso: fechaEgreso,
      salarioBase: empleado.salarioBase,
      promComisiones: empleado.promComisiones || 0,
      bonoIncentivo: empleado.bonoIncentivo || 0,
      estado: empleado.estado
    });
  }

  resetForm(): void {
    this.empleadoForm.reset({
      estado: 'ACTIVO',
      salarioBase: 0,
      promComisiones: 0,
      bonoIncentivo: 0
    });
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  hasError(controlName: string, error: string): boolean {
    const ctrl = this.empleadoForm.get(controlName);
    return !!ctrl && ctrl.touched && ctrl.hasError(error);
  }

  /**
   * Formatea un número como moneda guatemalteca (GTQ)
   * @param amount - Monto a formatear
   * @returns String con formato de moneda (Ej: Q3,500.00)
   */
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(amount);
  }

  /**
   * Formatea una fecha en formato legible
   * @param dateString - Fecha en formato ISO
   * @returns Fecha formateada o 'N/A' si no existe
   */
  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-GT');
  }

  /**
   * Calcula el Salario Devengado Total de un empleado
   * Salario Devengado (SD) = Salario Base + Comisiones + Bono Incentivo
   * Este es el salario que se usa como base para cálculos de prestaciones
   * @param empleado - Objeto empleado con salarios
   * @returns Monto total del salario devengado
   */
  calcularSalarioDevengado(empleado: Empleado): number {
    const salarioBase = empleado.salarioBase || 0;
    const comisiones = empleado.promComisiones || 0;
    const bono = empleado.bonoIncentivo || 0;
    
    // SD = Salario Base + Comisiones + Bono Incentivo
    return salarioBase + comisiones + bono;
  }
}
