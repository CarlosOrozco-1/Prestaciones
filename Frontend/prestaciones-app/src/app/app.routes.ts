import { Routes } from '@angular/router';
import { EmpleadosComponent } from './views/empleados/empleados.component';
import { LiquidacionesComponent } from './views/liquidaciones/liquidaciones.component';

export const routes: Routes = [
    {path: '', redirectTo: 'empleados', pathMatch: 'full' },
    {path: 'empleados', component: EmpleadosComponent },
    {path: 'liquidaciones', component: LiquidacionesComponent }
];
