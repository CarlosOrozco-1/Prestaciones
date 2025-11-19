using System.Data;
using Oracle.ManagedDataAccess.Client;
using Prestaciones_Api.Models;
using Prestaciones_API.Data;
using Prestaciones_API.Models;

var builder = WebApplication.CreateBuilder(args);

// =======================================
//  CONFIGURACIÓN DE SERVICIOS
// =======================================

// 🔹 Conexión a Oracle mediante factory
builder.Services.AddSingleton<OracleConnectionFactory>();

// 🔹 Swagger para pruebas
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// =======================================
//  MIDDLEWARES
// =======================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();


// ==============================================================
//  ENDPOINT: PRUEBA DE CONEXIÓN A ORACLE  (/api/health/db)
// ==============================================================
app.MapGet("/api/health/db", async (OracleConnectionFactory factory) =>
{
    try
    {
        await using var conn = factory.CreateConnection();
        await conn.OpenAsync();

        await using var cmd = new OracleCommand("SELECT 1 FROM DUAL", conn);
        var result = await cmd.ExecuteScalarAsync();

        return Results.Ok(new
        {
            ok = true,
            message = "Conexión a Oracle OK",
            value = result
        });
    }
    catch (Exception ex)
    {
        return Results.Problem(
            title: "Error al conectar a Oracle",
            detail: ex.Message
        );
    }
});


// ==============================================================
//                ENDPOINTS DE EMPLEADOS
//    CRUD usando PKG_PRESTACIONES (Minimal API)
// ==============================================================


// =======================================
//  LISTAR TODOS LOS EMPLEADOS
//  GET /api/empleados
// =======================================
app.MapGet("/api/empleados", async (OracleConnectionFactory factory) =>
{
    var empleados = new List<EmpleadoDto>();

    await using var conn = factory.CreateConnection();
    await conn.OpenAsync();

    await using var cmd = new OracleCommand("PKG_PRESTACIONES.SP_LISTAR_EMPLEADOS", conn)
    {
        CommandType = CommandType.StoredProcedure
    };

    var pCursor = cmd.Parameters.Add("P_CURSOR", OracleDbType.RefCursor);
    pCursor.Direction = ParameterDirection.Output;

    await using var reader = await cmd.ExecuteReaderAsync();

    while (await reader.ReadAsync())
    {
        empleados.Add(new EmpleadoDto(
            IdEmpleado: reader.GetInt32(reader.GetOrdinal("ID_EMPLEADO")),
            Dpi: reader.GetString(reader.GetOrdinal("DPI")),
            Nombres: reader.GetString(reader.GetOrdinal("NOMBRES")),
            Apellidos: reader.GetString(reader.GetOrdinal("APELLIDOS")),
            FechaIngreso: reader.GetDateTime(reader.GetOrdinal("FECHA_INGRESO")),
            FechaEgreso: reader.IsDBNull(reader.GetOrdinal("FECHA_EGRESO"))
                ? null
                : reader.GetDateTime(reader.GetOrdinal("FECHA_EGRESO")),
            SalarioBase: reader.GetDecimal(reader.GetOrdinal("SALARIO_BASE")),
            PromComisiones: reader.IsDBNull(reader.GetOrdinal("PROM_COMISIONES"))
                ? null
                : reader.GetDecimal(reader.GetOrdinal("PROM_COMISIONES")),
            BonoIncentivo: reader.IsDBNull(reader.GetOrdinal("BONO_INCENTIVO"))
                ? null
                : reader.GetDecimal(reader.GetOrdinal("BONO_INCENTIVO")),
            Estado: reader.GetString(reader.GetOrdinal("ESTADO"))
        ));
    }

    return Results.Ok(empleados);
});


// =======================================
//  OBTENER EMPLEADO POR ID
//  GET /api/empleados/{id}
// =======================================
app.MapGet("/api/empleados/{id:int}", async (int id, OracleConnectionFactory factory) =>
{
    await using var conn = factory.CreateConnection();
    await conn.OpenAsync();

    await using var cmd = new OracleCommand("PKG_PRESTACIONES.SP_OBTENER_EMPLEADO", conn)
    {
        CommandType = CommandType.StoredProcedure
    };

    cmd.Parameters.Add("P_ID_EMPLEADO", OracleDbType.Int32).Value = id;
    var pCursor = cmd.Parameters.Add("P_CURSOR", OracleDbType.RefCursor);
    pCursor.Direction = ParameterDirection.Output;

    await using var reader = await cmd.ExecuteReaderAsync();

    if (!await reader.ReadAsync())
        return Results.NotFound();

    var empleado = new EmpleadoDto(
        IdEmpleado: reader.GetInt32(reader.GetOrdinal("ID_EMPLEADO")),
        Dpi: reader.GetString(reader.GetOrdinal("DPI")),
        Nombres: reader.GetString(reader.GetOrdinal("NOMBRES")),
        Apellidos: reader.GetString(reader.GetOrdinal("APELLIDOS")),
        FechaIngreso: reader.GetDateTime(reader.GetOrdinal("FECHA_INGRESO")),
        FechaEgreso: reader.IsDBNull(reader.GetOrdinal("FECHA_EGRESO"))
            ? null
            : reader.GetDateTime(reader.GetOrdinal("FECHA_EGRESO")),
        SalarioBase: reader.GetDecimal(reader.GetOrdinal("SALARIO_BASE")),
        PromComisiones: reader.IsDBNull(reader.GetOrdinal("PROM_COMISIONES"))
            ? null
            : reader.GetDecimal(reader.GetOrdinal("PROM_COMISIONES")),
        BonoIncentivo: reader.IsDBNull(reader.GetOrdinal("BONO_INCENTIVO"))
            ? null
            : reader.GetDecimal(reader.GetOrdinal("BONO_INCENTIVO")),
        Estado: reader.GetString(reader.GetOrdinal("ESTADO"))
    );

    return Results.Ok(empleado);
});


// =======================================
//  CREAR EMPLEADO
//  POST /api/empleados
// =======================================
app.MapPost("/api/empleados", async (CreateEmpleadoDto dto, OracleConnectionFactory factory) =>
{
    await using var conn = factory.CreateConnection();
    await conn.OpenAsync();

    await using var cmd = new OracleCommand("PKG_PRESTACIONES.SP_CREAR_EMPLEADO", conn)
    {
        CommandType = CommandType.StoredProcedure
    };

    cmd.Parameters.Add("P_DPI", OracleDbType.Varchar2).Value = dto.Dpi;
    cmd.Parameters.Add("P_NOMBRES", OracleDbType.Varchar2).Value = dto.Nombres;
    cmd.Parameters.Add("P_APELLIDOS", OracleDbType.Varchar2).Value = dto.Apellidos;
    cmd.Parameters.Add("P_FECHA_INGRESO", OracleDbType.Date).Value = dto.FechaIngreso;
    cmd.Parameters.Add("P_SALARIO_BASE", OracleDbType.Decimal).Value = dto.SalarioBase;
    cmd.Parameters.Add("P_PROM_COMISIONES", OracleDbType.Decimal).Value =
        dto.PromComisiones ?? (object)DBNull.Value;
    cmd.Parameters.Add("P_BONO_INCENTIVO", OracleDbType.Decimal).Value =
        dto.BonoIncentivo ?? (object)DBNull.Value;

    var pOutId = cmd.Parameters.Add("P_ID_EMPLEADO_OUT", OracleDbType.Int32);
    pOutId.Direction = ParameterDirection.Output;

    await cmd.ExecuteNonQueryAsync();

    //convesión correcta desde oracledecimal

    var oracleDecimal = (Oracle.ManagedDataAccess.Types.OracleDecimal)pOutId.Value;
    var newId = oracleDecimal.ToInt32();

    return Results.Created($"/api/empleados/{newId}", new 
    { 
        IdEmpleado = newId,
        Message = $"El colaborador { dto.Nombres} {dto.Apellidos} fue registrado correctamente. " //respuesta al momento de registra correctamente.


    });


});


// =======================================
//  ACTUALIZAR EMPLEADO
//  PUT /api/empleados/{id}
// =======================================
app.MapPut("/api/empleados/{id:int}", async (int id, UpdateEmpleadoDto dto, OracleConnectionFactory factory) =>
{
    await using var conn = factory.CreateConnection();
    await conn.OpenAsync();

    await using var cmd = new OracleCommand("PKG_PRESTACIONES.SP_ACTUALIZAR_EMPLEADO", conn)
    {
        CommandType = CommandType.StoredProcedure
    };

    cmd.Parameters.Add("P_ID_EMPLEADO", OracleDbType.Int32).Value = id;
    cmd.Parameters.Add("P_DPI", OracleDbType.Varchar2).Value = dto.Dpi;
    cmd.Parameters.Add("P_NOMBRES", OracleDbType.Varchar2).Value = dto.Nombres;
    cmd.Parameters.Add("P_APELLIDOS", OracleDbType.Varchar2).Value = dto.Apellidos;
    cmd.Parameters.Add("P_FECHA_INGRESO", OracleDbType.Date).Value = dto.FechaIngreso;
    cmd.Parameters.Add("P_FECHA_EGRESO", OracleDbType.Date).Value =
        dto.FechaEgreso ?? (object)DBNull.Value;
    cmd.Parameters.Add("P_SALARIO_BASE", OracleDbType.Decimal).Value = dto.SalarioBase;
    cmd.Parameters.Add("P_PROM_COMISIONES", OracleDbType.Decimal).Value =
        dto.PromComisiones ?? (object)DBNull.Value;
    cmd.Parameters.Add("P_BONO_INCENTIVO", OracleDbType.Decimal).Value =
        dto.BonoIncentivo ?? (object)DBNull.Value;
    cmd.Parameters.Add("P_ESTADO", OracleDbType.Varchar2).Value = dto.Estado;

    await cmd.ExecuteNonQueryAsync();

    return Results.NoContent();
});

// ==============================================================
//       ENDPOINT: CALCULAR LIQUIDACIÓN DE UN EMPLEADO
//  POST /api/liquidaciones/calcular
//  Usa: PKG_PRESTACIONES.SP_CALCULAR_LIQ_EMPLEADO
// ==============================================================
app.MapPost("/api/liquidaciones/calcular",
    async (CalcularLiquidacionDto dto, OracleConnectionFactory factory) =>
    {
        try
        {
            await using var conn = factory.CreateConnection();
            await conn.OpenAsync();

            await using var cmd = new OracleCommand("PKG_PRESTACIONES.SP_CALCULAR_LIQ_EMPLEADO", conn)
            {
                CommandType = CommandType.StoredProcedure
            };

            // Parámetros de entrada
            cmd.Parameters.Add("P_ID_EMPLEADO", OracleDbType.Int32).Value = dto.IdEmpleado;
            cmd.Parameters.Add("P_FECHA_EGRESO", OracleDbType.Date).Value = dto.FechaEgreso;

            // Cursor de salida
            var pCursor = cmd.Parameters.Add("P_CURSOR", OracleDbType.RefCursor);
            pCursor.Direction = ParameterDirection.Output;

            // Ejecutar
            await using var reader = await cmd.ExecuteReaderAsync();

            if (!await reader.ReadAsync())
                return Results.NotFound(new { message = "No se generó liquidación." });

            // Convertir cada campo del cursor
            var resultado = new LiquidacionResultadoDto(
                IdLiquidacion: reader.GetInt32(reader.GetOrdinal("ID_LIQUIDACION")),
                IdEmpleado: reader.GetInt32(reader.GetOrdinal("ID_EMPLEADO")),
                FechaCalculo: reader.GetDateTime(reader.GetOrdinal("FECHA_CALCULO")),
                FechaEgreso: reader.GetDateTime(reader.GetOrdinal("FECHA_EGRESO")),
                DiasRelacion: reader.GetInt32(reader.GetOrdinal("DIAS_RELACION")),
                SalarioDevengado: reader.GetDecimal(reader.GetOrdinal("SALARIO_DEVENGADO")),
                Indemnizacion: reader.GetDecimal(reader.GetOrdinal("INDEMNIZACION")),
                Vacaciones: reader.GetDecimal(reader.GetOrdinal("VACACIONES")),
                Aguinaldo: reader.GetDecimal(reader.GetOrdinal("AGUINALDO")),
                Bono14: reader.GetDecimal(reader.GetOrdinal("BONO14")),
                VentajasEconomicas: reader.GetDecimal(reader.GetOrdinal("VENT_ECONOMICAS")),
                TotalPagar: reader.GetDecimal(reader.GetOrdinal("TOTAL_PAGAR"))
            );

            return Results.Ok(new
            {
                message = "Liquidación calculada exitosamente.",
                data = resultado
            });
        }
        catch (Exception ex)
        {
            return Results.Problem(
                title: "Error al calcular liquidación",
                detail: ex.Message
            );
        }
    });



app.Run();
