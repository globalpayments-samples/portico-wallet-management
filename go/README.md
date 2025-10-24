# Wallet Management - Go Implementation

A secure Go-based wallet management system for storing and managing payment methods using Global Payments multi-use tokens. Built with Go's standard library and Gorilla Mux, this implementation demonstrates wallet management capabilities without processing actual payments.

## Features

- **Multi-Use Token Creation** - Convert single-use tokens to secure stored payment tokens with customer data
- **Payment Method Management** - Add, view, edit, and manage stored payment methods
- **Mock Mode Testing** - Test functionality without live API credentials
- **JSON-Based Storage** - Simple file-based storage for demonstration
- **High Performance** - Efficient concurrent request handling with goroutines
- **Type-Safe** - Strongly-typed Go structs for all operations

## Requirements

- **Go** 1.23+ (configured for 1.23.4, works with 1.21+)
- **Go Modules** - Dependency management

## Setup

### 1. Navigate to Go Directory

```bash
cd go
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
- Download dependencies
- Build the application
- Start server on `http://localhost:8000`

Alternatively, manually run:

```bash
go mod download
go run .
```

### 4. Access the Web Interface

Open your browser and navigate to:

```
http://localhost:8000
```

## Project Structure

```
go/
├── README.md               # This file
├── .env.sample            # Environment configuration template
├── .env                   # Your credentials
├── go.mod                 # Go module definition
├── go.sum                 # Dependency checksums
├── run.sh                 # Quick start script
├── main.go                # HTTP server and routes
├── handlers.go            # Request handlers
├── types.go               # Data structures
├── paymentUtils.go        # Payment utilities
├── jsonStorage.go         # Storage implementation
├── mockResponses.go       # Mock data generator
└── data/                  # Storage directory
    ├── payment-methods.json # Saved payment methods
    └── config.json        # Mock mode configuration
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

### Go Architecture

The Go implementation leverages Go's strengths:

1. **Standard Library** - Built primarily with net/http and encoding/json
2. **Concurrency** - Goroutines for efficient request handling
3. **Type Safety** - Struct-based request/response handling
4. **Performance** - Fast JSON parsing and HTTP processing

### Multi-Use Token Creation

```go
type CustomerData struct {
    FirstName     string `json:"firstName"`
    LastName      string `json:"lastName"`
    Email         string `json:"email"`
    Phone         string `json:"phone"`
    StreetAddress string `json:"streetAddress"`
    City          string `json:"city"`
    State         string `json:"state"`
    BillingZip    string `json:"billingZip"`
    Country       string `json:"country"`
}

func CreateMultiUseTokenWithCustomer(
    paymentToken string,
    customerData CustomerData,
) (*entities.Customer, error) {
    customer := entities.NewCustomer()
    customer.FirstName = customerData.FirstName
    customer.LastName = customerData.LastName
    customer.Email = customerData.Email

    address := entities.NewAddress()
    address.StreetAddress1 = customerData.StreetAddress
    address.City = customerData.City
    address.State = customerData.State
    address.PostalCode = customerData.BillingZip
    customer.Address = address

    return customer.Create()
}
```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PUBLIC_API_KEY` | Global Payments public API key | No (for mock mode) | None |
| `SECRET_API_KEY` | Global Payments secret API key | No (for mock mode) | None |

### Go Modules

Key dependencies in `go.mod`:

```go
module github.com/globalpayments/card-payments-go

go 1.23.4

require (
    github.com/globalpayments/go-sdk v1.1.3
    github.com/google/uuid v1.6.0
    github.com/gorilla/mux v1.8.1
    github.com/joho/godotenv v1.5.1
    github.com/rs/cors v1.10.1
)
```

## Build and Deployment

### Development

```bash
go run .
```

### Production Build

```bash
go build -o wallet-management-go
./wallet-management-go
```

### Cross-Platform Compilation

```bash
# Linux
GOOS=linux GOARCH=amd64 go build -o wallet-linux

# Windows
GOOS=windows GOARCH=amd64 go build -o wallet.exe

# macOS
GOOS=darwin GOARCH=amd64 go build -o wallet-macos
```

## Troubleshooting

### Common Issues

**Issue:** "Go version too old"
```bash
# Update Go
# Download from https://golang.org/dl/
go version  # Should be 1.21+
```

**Issue:** "Module download fails"
```bash
# Clean and re-download
go clean -modcache
go mod download
go mod tidy
```

**Issue:** "Port 8000 already in use"
```bash
# Change port in main.go or set environment variable
PORT=8080 go run .
```

**Issue:** "SDK configuration failed"
- Verify `.env` file exists with valid credentials
- Check console logs for initialization errors
- Enable mock mode for testing without credentials

**Issue:** "Build fails"
- Ensure all .go files are in the same directory
- Check for import cycle errors
- Run `go mod tidy` to clean dependencies

## Security

### Production Deployment

For production use, implement:

1. **Database Storage** - Replace JSON with PostgreSQL/MySQL using GORM or database/sql
2. **Authentication** - Add JWT middleware or session management
3. **HTTPS** - Configure TLS certificates
4. **Rate Limiting** - Implement rate limiting middleware
5. **Logging** - Add structured logging (logrus, zap)
6. **Monitoring** - Integrate Prometheus metrics
7. **Containerization** - Docker deployment with multi-stage builds
8. **Graceful Shutdown** - Implement context-based shutdown handling

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

## Dependencies

- **globalpayments/go-sdk** (1.1.3) - Global Payments Go SDK
- **gorilla/mux** (1.8.1) - HTTP router
- **joho/godotenv** (1.5.1) - Environment variable management
- **rs/cors** (1.10.1) - CORS middleware
- **google/uuid** (1.6.0) - UUID generation

## Next Steps

1. Explore the web interface at `http://localhost:8000`
2. Test with mock mode enabled
3. Integrate wallet management into your Go application
4. Build production-ready version with database storage
5. Implement authentication and TLS for production deployment

## Support

- **Global Payments Documentation:** [developer.globalpay.com/docs](https://developer.globalpay.com/docs)
- **Go SDK Documentation:** [github.com/globalpayments/go-sdk](https://github.com/globalpayments/go-sdk)
- **API Reference:** [developer.globalpay.com/api](https://developer.globalpay.com/api)

## License

MIT License - See LICENSE file for details.
