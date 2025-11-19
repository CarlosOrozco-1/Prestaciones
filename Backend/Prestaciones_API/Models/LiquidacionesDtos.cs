namespace Prestaciones_API.Models
{
    // Datos que enviará el frontend al calcular la liquidación
    public record CalcularLiquidacionDto(
        int IdEmpleado,
        DateTime FechaEgreso
    );

    // Datos que devolverá el backend al frontend
    public record LiquidacionResultadoDto(
        int IdLiquidacion,
        int IdEmpleado,
        DateTime FechaCalculo,
        DateTime FechaEgreso,
        int DiasRelacion,
        decimal SalarioDevengado,
        decimal Indemnizacion,
        decimal Vacaciones,
        decimal Aguinaldo,
        decimal Bono14,
        decimal VentajasEconomicas,
        decimal TotalPagar
    );

    // DTO para el historial de liquidaciones
    public record HistorialLiquidacionDto(
        int IdLiquidacion,
        int IdEmpleado,
        string NombreCompleto,
        DateTime FechaCalculo,
        DateTime FechaEgreso,
        int DiasRelacion,
        decimal SalarioDevengado,
        decimal Indemnizacion,
        decimal Vacaciones,
        decimal Aguinaldo,
        decimal Bono14,
        decimal VentajasEconomicas,
        decimal TotalPagar
    );
}
