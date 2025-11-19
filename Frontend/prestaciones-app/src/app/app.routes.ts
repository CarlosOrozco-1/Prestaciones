import { Routes } from '@angular/router';
import { InicioComponent } from './views/inicio/inicio.component';
import { EmpleadosComponent } from './views/empleados/empleados.component';
import { LiquidacionesComponent } from './views/liquidaciones/liquidaciones.component';
import { HistorialComponent } from './views/historial/historial.component';

export const routes: Routes = [
    {path: '', redirectTo: 'inicio', pathMatch: 'full' },
    {path: 'inicio', component: InicioComponent },
    {path: 'empleados', component: EmpleadosComponent },
    {path: 'liquidaciones', component: LiquidacionesComponent },
    {path: 'historial', component: HistorialComponent }
];
