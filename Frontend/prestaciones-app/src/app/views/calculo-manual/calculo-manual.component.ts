import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

interface TipoPrestacion {
  id: string;
  nombre: string;
  descripcion: string;
  formula: string;
  icon: string;
}

interface ResultadoCalculo {
  concepto: string;
  valor: number;
  formula: string;
  detalles: { [key: string]: any };
}

@Component({
  selector: 'app-calculo-manual',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './calculo-manual.component.html',
  styleUrl: './calculo-manual.component.css'
})
export class CalculoManualComponent implements OnInit {
  
  currentStep = 1;
  maxSteps = 4;
  
  tipoSeleccionForm: FormGroup;
  datosPersonalesForm: FormGroup;
  datosLaboralesForm: FormGroup;
  resultadoForm: FormGroup;

  tiposPrestaciones: TipoPrestacion[] = [
    {
      id: 'vacaciones',
      nombre: 'Vacaciones',
      descripcion: 'Cálculo de días de vacaciones y compensación por vacaciones no gozadas según Código de Trabajo Guatemala',
      formula: 'Salario diario (Salario ÷ 30) × Días de vacaciones no gozados',
      icon: '🏖️'
    },
    {
      id: 'aguinaldo',
      nombre: 'Aguinaldo',
      descripcion: 'Cálculo de aguinaldo según normativa guatemalteca',
      formula: 'Salario × Días trabajados / 365',
      icon: '🎄'
    },
    {
      id: 'bono14',
      nombre: 'Bono 14',
      descripcion: 'Cálculo del bono 14 según Decreto 42-92 Guatemala',
      formula: 'Salario × Días trabajados / 365',
      icon: '💰'
    },
    {
      id: 'indemnizacion',
      nombre: 'Indemnización',
      descripcion: 'Cálculo de indemnización por despido injustificado Guatemala',
      formula: 'Salario × Años de servicio',
      icon: '⚖️'
    }
  ];

  tipoSeleccionado: TipoPrestacion | null = null;
  resultado: ResultadoCalculo | null = null;
  isCalculating = false;

  constructor(private fb: FormBuilder) {
    // Inicialización en constructor para evitar errores
    this.tipoSeleccionForm = this.fb.group({
      tipoPrestacion: ['', Validators.required]
    });

    this.datosPersonalesForm = this.fb.group({
      nombreCompleto: ['', Validators.required],
      identificacion: [''],
      cargo: ['', Validators.required]
    });

    this.datosLaboralesForm = this.fb.group({
      salarioBase: [0, [Validators.required, Validators.min(1)]],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      diasTrabajados: [0, [Validators.required, Validators.min(1)]],
      horasExtras: [0, Validators.min(0)],
      bonificaciones: [0, Validators.min(0)],
      auxilioTransporte: [0, Validators.min(0)]
    });

    this.resultadoForm = this.fb.group({});
  }

  ngOnInit(): void {
    // Suscribirse a cambios en fechas para calcular días automáticamente
    this.datosLaboralesForm.get('fechaInicio')?.valueChanges.subscribe(() => {
      this.calcularDiasTrabajados();
    });

    this.datosLaboralesForm.get('fechaFin')?.valueChanges.subscribe(() => {
      this.calcularDiasTrabajados();
    });
  }

  // Navegación del stepper
  nextStep(): void {
    if (this.currentStep < this.maxSteps) {
      if (this.isStepValid(this.currentStep)) {
        this.currentStep++;
        
        // Si llegamos al último paso, preparar cálculo
        if (this.currentStep === this.maxSteps) {
          this.prepararCalculo();
        }
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    // Validar que se pueda ir al paso solicitado
    if (step <= this.currentStep + 1 && step >= 1) {
      this.currentStep = step;
    }
  }

  isStepValid(step: number): boolean {
    switch (step) {
      case 1:
        return this.tipoSeleccionForm.valid;
      case 2:
        return this.datosPersonalesForm.valid;
      case 3:
        return this.datosLaboralesForm.valid;
      case 4:
        return true;
      default:
        return false;
    }
  }

  // Selección del tipo de prestación
  seleccionarTipo(tipo: TipoPrestacion): void {
    this.tipoSeleccionado = tipo;
    this.tipoSeleccionForm.patchValue({
      tipoPrestacion: tipo.id
    });
  }

  // Cálculo de días trabajados
  calcularDiasTrabajados(): void {
    const fechaInicio = this.datosLaboralesForm.get('fechaInicio')?.value;
    const fechaFin = this.datosLaboralesForm.get('fechaFin')?.value;

    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      const diffTime = Math.abs(fin.getTime() - inicio.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      this.datosLaboralesForm.patchValue({
        diasTrabajados: diffDays
      });
    }
  }

  // Preparación para el cálculo
  prepararCalculo(): void {
    if (this.tipoSeleccionado) {
      this.calcularPrestacion();
    }
  }

  // Cálculo principal
  calcularPrestacion(): void {
    if (!this.tipoSeleccionado) return;

    this.isCalculating = true;
    
    // Simular tiempo de cálculo
    setTimeout(() => {
      const datosLaborales = this.datosLaboralesForm.value;
      const datosPersonales = this.datosPersonalesForm.value;
      
      let resultado: ResultadoCalculo;

      switch (this.tipoSeleccionado!.id) {
        case 'vacaciones':
          resultado = this.calcularVacaciones(datosLaborales);
          break;
        case 'aguinaldo':
          resultado = this.calcularAguinaldo(datosLaborales);
          break;
        case 'bono14':
          resultado = this.calcularBono14(datosLaborales);
          break;
        case 'indemnizacion':
          resultado = this.calcularIndemnizacion(datosLaborales);
          break;
        default:
          resultado = {
            concepto: 'Sin cálculo',
            valor: 0,
            formula: '',
            detalles: {}
          };
      }

      this.resultado = {
        ...resultado,
        detalles: {
          ...resultado.detalles,
          nombreEmpleado: datosPersonales.nombreCompleto,
          cargo: datosPersonales.cargo,
          identificacion: datosPersonales.identificacion
        }
      };

      this.isCalculating = false;
    }, 1500);
  }

  // Cálculos específicos
  // MODIFICADO: Cálculo de vacaciones corregido según normativa guatemalteca
  // Fórmula correcta: (Salario mensual ÷ 30 días) × Días de vacaciones no gozados
  // 1. Días de vacaciones que corresponden al empleado
  // 2. Compensación económica por vacaciones no gozadas en caso de despido
  calcularVacaciones(datos: any): ResultadoCalculo {
    const salarioBase = datos.salarioBase;
    const diasTrabajados = datos.diasTrabajados;
    
    // Cálculo de días de vacaciones según Código de Trabajo Guatemala
    // Artículo 130: 15 días hábiles anuales después de un año de trabajo
    const diasVacacionesAnuales = 15;
    const diasVacacionesProporcionales = (diasTrabajados / 365) * diasVacacionesAnuales;
    
    // CORREGIDO: Cálculo del salario diario
    // Se divide el salario mensual entre 30 días (días laborables del mes)
    const salarioDiario = salarioBase / 30;
    
    // CORREGIDO: Compensación económica por vacaciones no gozadas
    // Fórmula: Salario diario × Días de vacaciones proporcionales
    const compensacionVacaciones = salarioDiario * diasVacacionesProporcionales;
    
    // Compensación adicional por no goce (según jurisprudencia guatemalteca)
    // Se agrega un 50% adicional como compensación por el no goce efectivo
    const compensacionAdicional = compensacionVacaciones * 0.5;
    const compensacionTotal = compensacionVacaciones + compensacionAdicional;

    return {
      concepto: 'Vacaciones',
      valor: compensacionTotal, // Valor total por despido sin goce
      formula: 'Salario diario (Salario/30) × Días vacaciones + 50% compensación',
      detalles: {
        salarioBase: salarioBase,
        diasTrabajados: diasTrabajados,
        diasVacacionesAnuales: diasVacacionesAnuales,
        diasVacacionesProporcionales: Math.round(diasVacacionesProporcionales * 100) / 100,
        salarioDiario: salarioDiario, // NUEVO: Campo para mostrar salario diario
        compensacionBasica: compensacionVacaciones,
        compensacionAdicional: compensacionAdicional,
        compensacionTotal: compensacionTotal,
        calculoDetallado: `Salario diario: ${this.formatCurrency(salarioDiario)} | Días: ${Math.round(diasVacacionesProporcionales * 100) / 100} | Compensación: ${this.formatCurrency(compensacionVacaciones)} + ${this.formatCurrency(compensacionAdicional)} = ${this.formatCurrency(compensacionTotal)}`
      }
    };
  }

  calcularAguinaldo(datos: any): ResultadoCalculo {
    const salarioBase = datos.salarioBase;
    const diasTrabajados = datos.diasTrabajados;
    const valor = salarioBase * diasTrabajados / 365;

    return {
      concepto: 'Aguinaldo',
      valor: valor,
      formula: 'Salario × Días trabajados ÷ 365',
      detalles: {
        salarioBase: salarioBase,
        diasTrabajados: diasTrabajados,
        calculoDetallado: `${this.formatCurrency(salarioBase)} × ${diasTrabajados} ÷ 365 = ${this.formatCurrency(valor)}`
      }
    };
  }

  calcularBono14(datos: any): ResultadoCalculo {
    const salarioBase = datos.salarioBase;
    const diasTrabajados = datos.diasTrabajados;
    const valor = salarioBase * diasTrabajados / 365;

    return {
      concepto: 'Bono 14',
      valor: valor,
      formula: 'Salario × Días trabajados ÷ 365',
      detalles: {
        salarioBase: salarioBase,
        diasTrabajados: diasTrabajados,
        calculoDetallado: `${this.formatCurrency(salarioBase)} × ${diasTrabajados} ÷ 365 = ${this.formatCurrency(valor)}`
      }
    };
  }

  calcularIndemnizacion(datos: any): ResultadoCalculo {
    const salarioBase = datos.salarioBase;
    const diasTrabajados = datos.diasTrabajados;
    const anosServicio = diasTrabajados / 365;
    const valor = salarioBase * anosServicio;

    return {
      concepto: 'Indemnización',
      valor: valor,
      formula: 'Salario × Años de servicio',
      detalles: {
        salarioBase: salarioBase,
        anosServicio: anosServicio,
        diasTrabajados: diasTrabajados,
        calculoDetallado: `${this.formatCurrency(salarioBase)} × ${anosServicio.toFixed(2)} años = ${this.formatCurrency(valor)}`
      }
    };
  }

  // Reiniciar cálculo
  nuevoCalculo(): void {
    this.currentStep = 1;
    this.tipoSeleccionado = null;
    this.resultado = null;
    this.tipoSeleccionForm.reset();
    this.datosPersonalesForm.reset();
    this.datosLaboralesForm.reset();
    this.resultadoForm.reset();
  }

  // Utilidades
  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2
    }).format(value);
  }

  formatDate(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-GT');
  }

  // Getters para las validaciones del template
  get isTipoSeleccionValid(): boolean {
    return this.tipoSeleccionForm.valid;
  }

  get isDatosPersonalesValid(): boolean {
    return this.datosPersonalesForm.valid;
  }

  get isDatosLaboralesValid(): boolean {
    return this.datosLaboralesForm.valid;
  }
}