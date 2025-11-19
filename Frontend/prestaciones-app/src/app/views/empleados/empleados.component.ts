import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  PrestacionesApiService,
  Empleado
} from '../../services/prestaciones-api.service';

@Component({
  selector: 'app-empleados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './empleados.component.html',
  styleUrls: ['./empleados.component.css'],
})
export class EmpleadosComponent implements OnInit {

  empleados: Empleado[] = [];
  loading = false;
  errorMessage = '';

  constructor(private api: PrestacionesApiService) {}

  ngOnInit(): void {
    this.cargarEmpleados();
  }

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
}
