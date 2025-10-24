# Wallet Management - .NET Implementation

A secure ASP.NET Core wallet management system for storing and managing payment methods using Global Payments multi-use tokens. Built with .NET 9.0, this implementation demonstrates wallet management capabilities without processing actual payments.

## Features

- **Multi-Use Token Creation** - Convert single-use tokens to secure stored payment tokens with customer data
- **Payment Method Management** - Add, view, edit, and manage stored payment methods
- **Mock Mode Testing** - Test functionality without live API credentials
- **JSON-Based Storage** - Simple file-based storage for demonstration
- **ASP.NET Core** - Modern minimal API with built-in DI and middleware
- **Type-Safe** - Strongly-typed C# models for all operations

## Requirements

- **.NET** 9.0 or higher (SDK)
- **dotnet CLI** - Command-line interface

## Setup

### 1. Navigate to .NET Directory

```bash
cd dotnet
```

### 2. Configure Credentials

Copy the sample environment file:

```bash
cp .env.sample .env
```

Edit `.env` and add your Global Payments API credentials:

```bash
PUBLIC_API_KEY=pkapi_your_public_key_here
SECRET_API_KEY=skapi_your_secret_key_here
```

**Note:** Credentials are optional. You can test the system in mock mode without real API keys.

### 3. Run the Server

```bash
./run.sh
```

This command will:
- Restore NuGet packages
- Build the application
- Start server on `http://localhost:8000`

Alternatively, manually run:

```bash
dotnet restore
dotnet run
```

### 4. Access the Web Interface

Open your browser and navigate to:

```
http://localhost:8000
```

## Project Structure

```
dotnet/
├── README.md                # This file
├── .env.sample             # Environment configuration template
├── .env                    # Your credentials
├── dotnet.csproj           # .NET project file
├── run.sh                  # Quick start script
├── Program.cs              # Main application and endpoints
├── Models.cs               # Data models
├── PaymentUtils.cs         # Payment utilities
├── JsonStorage.cs          # Storage implementation
├── MockResponses.cs        # Mock data generator
├── wwwroot/                # Static files
│   └── index.html         # Web interface
└── data/                   # Storage directory
    ├── payment-methods.json # Saved payment methods
    └── config.json         # Mock mode configuration
```

## API Endpoints

All endpoints follow the same REST API contract as other implementations. See the root README for complete API documentation.

### Quick Reference

- `GET /health` - System health check
- `GET /config` - Get public API key
- `GET /payment-methods` - List payment methods
- `POST /payment-methods` - Create or edit payment method
- `GET /mock-mode` - Get mock mode status
- `POST /mock-mode` - Toggle mock mode

## How It Works

### ASP.NET Core Minimal API

The .NET implementation uses modern ASP.NET Core features:

1. **Minimal API** - Lightweight endpoint definitions
2. **Built-in DI** - Dependency injection container
3. **Middleware** - CORS, JSON serialization, static files
4. **Type Safety** - Strongly-typed models and validation

### Multi-Use Token Creation

```csharp
public class CustomerData
{
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    public string Phone { get; set; }
    public string StreetAddress { get; set; }
    public string City { get; set; }
    public string State { get; set; }
    public string BillingZip { get; set; }
    public string Country { get; set; }
}

public static Customer CreateMultiUseTokenWithCustomer(
    string paymentToken,
    CustomerData customerData)
{
    var customer = new Customer
    {
        FirstName = customerData.FirstName,
        LastName = customerData.LastName,
        Email = customerData.Email,
        HomePhone = customerData.Phone
    };

    customer.Address = new Address
    {
        StreetAddress1 = customerData.StreetAddress,
        City = customerData.City,
        State = customerData.State,
        PostalCode = customerData.BillingZip,
        Country = customerData.Country
    };

    return customer.Create();
}
```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PUBLIC_API_KEY` | Global Payments public API key | No (for mock mode) | None |
| `SECRET_API_KEY` | Global Payments secret API key | No (for mock mode) | None |

### Project Configuration

Key settings in `dotnet.csproj`:

```xml
<Project Sdk="Microsoft.NET.Sdk.Web">
  <PropertyGroup>
    <TargetFramework>net9.0</TargetFramework>
    <Nullable>enable</Nullable>
    <ImplicitUsings>enable</ImplicitUsings>
  </PropertyGroup>

  <ItemGroup>
    <PackageReference Include="GlobalPayments.Api" Version="9.0.16" />
    <PackageReference Include="DotEnv.Net" Version="3.2.1" />
  </ItemGroup>
</Project>
```

## Build and Deployment

### Development

```bash
dotnet run
```

### Production Build

```bash
dotnet publish -c Release -o ./publish
cd publish
./dotnet
```

### Docker Support

Create a `Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore
RUN dotnet publish -c Release -o /app

FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app .
EXPOSE 8000
ENTRYPOINT ["dotnet", "dotnet.dll"]
```

Build and run:

```bash
docker build -t wallet-management-dotnet .
docker run -p 8000:8000 wallet-management-dotnet
```

## Troubleshooting

### Common Issues

**Issue:** ".NET SDK not found"
```bash
# Check .NET version
dotnet --version
# Should be 9.0 or higher

# Install from https://dotnet.microsoft.com/download
```

**Issue:** "NuGet restore fails"
```bash
# Clean and restore
dotnet clean
dotnet nuget locals all --clear
dotnet restore
```

**Issue:** "Port 5000/5001 already in use"
```bash
# Change port in Program.cs or use command line
dotnet run --urls "http://localhost:8080"
```

**Issue:** "SDK configuration failed"
- Verify `.env` file exists with valid credentials
- Check console logs for initialization errors
- Enable mock mode for testing without credentials

**Issue:** "Build fails"
- Check for missing packages: `dotnet restore`
- Verify target framework compatibility
- Check for syntax errors: `dotnet build`

## Security

### Production Deployment

For production use, implement:

1. **Database Storage** - Replace JSON with Entity Framework Core + SQL Server/PostgreSQL
2. **Authentication** - Add ASP.NET Core Identity or JWT authentication
3. **HTTPS** - Configure HTTPS certificates and HSTS
4. **Rate Limiting** - Implement rate limiting middleware
5. **Logging** - Add Serilog or NLog for structured logging
6. **Monitoring** - Integrate Application Insights or Prometheus
7. **Input Validation** - Add FluentValidation for request validation
8. **Security Headers** - Implement security headers middleware

## Testing

### Manual Testing

```bash
# Health check
curl http://localhost:8000/health

# Enable mock mode
curl -X POST http://localhost:8000/mock-mode \
  -H "Content-Type: application/json" \
  -d '{"isEnabled": true}'

# Add payment method
curl -X POST http://localhost:8000/payment-methods \
  -H "Content-Type: application/json" \
  -d '{
    "paymentToken": "supt_test_4242424242424242",
    "cardDetails": {
      "cardType": "visa",
      "cardLast4": "4242",
      "expiryMonth": "12",
      "expiryYear": "2028"
    },
    "customerData": {
      "firstName": "Jane",
      "lastName": "Doe",
      "email": "jane@example.com"
    }
  }'
```

### Unit Testing

Add xUnit tests:

```bash
dotnet add package xunit
dotnet add package xunit.runner.visualstudio
dotnet test
```

## Dependencies

- **GlobalPayments.Api** (9.0.16) - Global Payments .NET SDK
- **DotEnv.Net** (3.2.1) - Environment variable management

## Next Steps

1. Explore the web interface at `http://localhost:8000`
2. Test with mock mode enabled
3. Integrate wallet management into your ASP.NET Core application
4. Add Entity Framework Core for database storage
5. Implement authentication and authorization for production

## Support

- **Global Payments Documentation:** [developer.globalpay.com/docs](https://developer.globalpay.com/docs)
- **.NET SDK Documentation:** [github.com/globalpayments/dotnet-sdk](https://github.com/globalpayments/dotnet-sdk)
- **API Reference:** [developer.globalpay.com/api](https://developer.globalpay.com/api)

## License

MIT License - See LICENSE file for details.
