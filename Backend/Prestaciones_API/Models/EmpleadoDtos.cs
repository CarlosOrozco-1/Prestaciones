namespace Prestaciones_Api.Models
{
    // Lo que devolvemos al frontend
    public record EmpleadoDto(
        int IdEmpleado,
        string Dpi,
        string Nombres,
        string Apellidos,
        DateTime FechaIngreso,
        DateTime? FechaEgreso,
        decimal SalarioBase,
        decimal? PromComisiones,
        decimal? BonoIncentivo,
        string Estado
    );

    // Lo que recibimos al crear un empleado
    public record CreateEmpleadoDto(
        string Dpi,
        string Nombres,
        string Apellidos,
        DateTime FechaIngreso,
        decimal SalarioBase,
        decimal? PromComisiones,
        decimal? BonoIncentivo
    );

    // Lo que recibimos al actualizar un empleado
    public record UpdateEmpleadoDto(
        string Dpi,
        string Nombres,
        string Apellidos,
        DateTime FechaIngreso,
        DateTime? FechaEgreso,
        decimal SalarioBase,
        decimal? PromComisiones,
        decimal? BonoIncentivo,
        string Estado
    );
}
