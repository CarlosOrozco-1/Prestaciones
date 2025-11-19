using Microsoft.Extensions.Configuration;
using Oracle.ManagedDataAccess.Client;

namespace Prestaciones_API.Data
{
    public class OracleConnectionFactory
    {
        private readonly string _connectionString;
        public OracleConnectionFactory(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("OracleDB")
            ?? throw new InvalidOperationException("Connection string 'Oracle' not found.");
        }

        public OracleConnection CreateConnection()
        {
            return new OracleConnection(_connectionString);
        }
    }
}
