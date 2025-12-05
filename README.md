# Wallet Management System

A secure multi-language wallet management system demonstrating Global Payments SDK integration across five programming languages. Store, view, edit, and manage payment methods using secure multi-use stored payment tokens with customer data integration.

## Available Implementations

| Language | Tech Stack | Port | Setup Command |
|----------|-----------|------|---------------|
| [PHP](/php/) | PHP 7.4+ with Composer | 8000 | `./run.sh` |
| [Node.js](/nodejs/) | Express.js + ES6 Modules | 8000 | `./run.sh` |
| [Java](/java/) | Jakarta EE + Tomcat 10 | 8000 | `./run.sh` |
| [Go](/go/) | Go 1.23+ with Gorilla Mux | 8000 | `./run.sh` |
| [.NET](/dotnet/) | ASP.NET Core 9.0 | 8000 | `./run.sh` |

All implementations provide identical functionality with consistent REST API endpoints.

## Core Features

This system focuses exclusively on **wallet management** - not payment processing:

- **Multi-Use Token Creation** - Convert single-use tokens to secure multi-use stored payment tokens
- **Customer Data Integration** - Associate billing information with payment tokens
- **Payment Method Storage** - Securely store and retrieve payment method metadata
- **Edit Payment Methods** - Update nicknames and default payment preferences
- **Mock Mode Testing** - Test functionality without live API credentials
- **JSON-Based Storage** - Simple file-based storage for demonstration purposes

## What This System Does NOT Do

- Does not process payments or charge cards
- Does not handle transactions or authorization
- Does not calculate amounts or fees
- Focuses purely on managing a wallet of stored payment methods

## Quick Start

### 1. Choose Your Language Implementation

Navigate to any implementation directory:

```bash
cd php        # PHP implementation
cd nodejs     # Node.js implementation
cd java       # Java implementation
cd go         # Go implementation
cd dotnet     # .NET implementation
```

### 2. Set Up Credentials

Copy the environment file and add your Global Payments API keys:

```bash
cp .env.sample .env
```

Edit `.env` and add your credentials:

```bash
PUBLIC_API_KEY=pkapi_your_public_key_here
SECRET_API_KEY=skapi_your_secret_key_here
```

**Note:** Credentials are optional. Mock mode allows testing without real API keys.

### 3. Run the Server

Execute the run script to install dependencies and start the server:

```bash
./run.sh
```

### 4. Access the Web Interface

Open your browser and navigate to:

```
http://localhost:8000
```

The interface provides a complete wallet management UI for testing all functionality.

## API Endpoints

All implementations provide the same 6 REST endpoints:

### System Endpoints

**GET `/health`** - System health check
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "sdkStatus": "configured",
    "mockMode": false
  }
}
```

**GET `/config`** - Get public API key for frontend SDK
```json
{
  "success": true,
  "data": {
    "publicApiKey": "pkapi_...",
    "mockMode": false
  }
}
```

### Payment Method Management

**GET `/payment-methods`** - List all saved payment methods
```json
{
  "success": true,
  "data": [
    {
      "id": "pm_123",
      "type": "card",
      "brand": "Visa",
      "last4": "4242",
      "expiry": "12/2028",
      "nickname": "Personal Visa",
      "isDefault": true
    }
  ]
}
```

**POST `/payment-methods`** - Add or edit payment method

*Create new payment method:*
```json
{
  "paymentToken": "supt_abc123",
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
  },
  "nickname": "Personal Visa",
  "isDefault": true
}
```

*Edit existing payment method:*
```json
{
  "id": "pm_123",
  "nickname": "Updated Nickname",
  "isDefault": true
}
```

### Mock Mode Management

**GET `/mock-mode`** - Get current mock mode status
```json
{
  "success": true,
  "data": {
    "isEnabled": false
  }
}
```

**POST `/mock-mode`** - Toggle mock mode on/off
```json
{
  "isEnabled": true
}
```

## Architecture

### Token Flow

The system implements a secure token flow that keeps card data off your servers:

1. **Frontend Token Collection**
   - Customer enters card details in Heartland Hosted Fields
   - Heartland secures the data and returns a single-use token
   - Token is sent to your backend

2. **Multi-Use Token Creation**
   - Backend receives single-use token + customer data
   - System calls Global Payments API to create multi-use token
   - Multi-use token is associated with customer billing information

3. **Secure Storage**
   - Payment method metadata stored (brand, last4, expiry, nickname)
   - Multi-use token stored for future use
   - No sensitive card data touches your servers

4. **Retrieval & Management**
   - List saved payment methods
   - Edit nicknames and default preferences
   - Use stored payment tokens for future payment processing

### Multi-Use Tokens with Customer Data

Multi-use tokens are superior to single-use tokens because they:

- Can be reused for multiple transactions
- Include associated customer billing information
- Provide better reporting and reconciliation
- Enable customer-specific payment workflows

The system creates multi-use tokens by calling:

```
Token API: POST /Hps/Exchange/PosGateway/Api/v1/PaymentMethods/Token/MultiUse
```

With customer data:
```json
{
  "singleUseToken": "supt_...",
  "customer": {
    "firstName": "Jane",
    "lastName": "Doe",
    "email": "jane@example.com"
  },
  "card": {
    "expiryMonth": "12",
    "expiryYear": "2028"
  }
}
```

### Mock Mode

Mock mode allows development and testing without live API credentials:

- Simulates API responses with realistic data
- Uses test card numbers (Visa 4242, Mastercard 5454, etc.)
- Persists mock mode preference across server restarts
- Perfect for frontend development and CI/CD pipelines

## Use Cases

This wallet management system is ideal for:

- **Payment Method Storage** - Building a wallet of customer payment methods
- **Customer Portal Development** - Allow customers to manage their payment methods
- **Subscription Services** - Store payment methods for recurring billing
- **Marketplace Platforms** - Manage customer payment preferences
- **Integration Testing** - Test wallet functionality without processing real payments
- **Payment Processing Foundation** - Build payment processing systems on top of secure wallet storage

## Technology Comparison

### PHP Implementation
- **Framework:** Native PHP with Composer
- **Web Server:** PHP built-in server
- **Best For:** Rapid prototyping, shared hosting environments
- **Dependencies:** globalpayments/php-sdk, vlucas/phpdotenv

### Node.js Implementation
- **Framework:** Express.js with ES6 modules
- **Best For:** Modern JavaScript applications, microservices
- **Dependencies:** globalpayments-api, express, dotenv

### Java Implementation
- **Framework:** Jakarta EE servlets
- **Server:** Apache Tomcat 10
- **Best For:** Enterprise applications, Spring Boot integration
- **Dependencies:** globalpayments-sdk, dotenv-java

### Go Implementation
- **Framework:** Native Go with Gorilla Mux
- **Best For:** High-performance systems, containerized deployments
- **Dependencies:** globalpayments/go-sdk, gorilla/mux

### .NET Implementation
- **Framework:** ASP.NET Core 9.0
- **Best For:** Microsoft ecosystems, Azure deployments
- **Dependencies:** GlobalPayments.Api, DotEnv.Net

## Security Considerations

### For Production Deployment

This is a demonstration application. Before deploying to production:

1. **Database Integration**
   - Replace JSON file storage with encrypted database storage
   - Implement proper transaction management
   - Add data backup and recovery procedures

2. **Authentication & Authorization**
   - Implement user authentication system
   - Add role-based access control (RBAC)
   - Ensure users can only access their own payment methods

3. **Enhanced Security**
   - Enable HTTPS/TLS encryption
   - Implement rate limiting and DDoS protection
   - Add security headers (CSP, HSTS, etc.)
   - Implement audit logging for all operations
   - Add fraud detection and monitoring

4. **PCI Compliance**
   - Review PCI DSS requirements for token storage
   - Implement secure key management
   - Regular security audits and penetration testing
   - Compliance documentation and training

5. **Error Handling**
   - Implement comprehensive error handling
   - Avoid exposing sensitive information in errors
   - Add structured logging and monitoring
   - Set up alerting for critical errors

6. **API Security**
   - Implement API key rotation
   - Add request signing and validation
   - Implement webhook signature verification
   - Use environment-specific credentials

## Prerequisites

- **Global Payments Account** - Sign up at [developer.globalpay.com](https://developer.globalpay.com)
- **API Credentials** - Obtain public and secret API keys
- **Development Environment** - Language runtime for your chosen implementation

## Support & Documentation

- **Global Payments Documentation:** [developer.globalpay.com/docs](https://developer.globalpay.com/docs)
- **API Reference:** [developer.globalpay.com/api](https://developer.globalpay.com/api)
- **SDK Documentation:** Check each language implementation's README

## License

MIT License - see individual implementation directories for details.

## Contributing

Contributions are welcome! Each implementation follows the same API contract, so improvements should be consistent across all languages.

## Project Structure

```
portico-wallet-management/
├── README.md                    # This file - project overview
├── index.html                   # Shared frontend UI
├── php/                         # PHP implementation
│   ├── README.md
│   └── ...
├── nodejs/                      # Node.js implementation
│   ├── README.md
│   └── ...
├── java/                        # Java implementation
│   ├── README.md
│   └── ...
├── go/                          # Go implementation
│   ├── README.md
│   └── ...
└── dotnet/                      # .NET implementation
    ├── README.md
    └── ...
```

## Next Steps

1. Choose your preferred language implementation
2. Read the language-specific README in that directory
3. Follow the setup instructions
4. Explore the web interface at `http://localhost:8000`
5. Review the API endpoints and integrate with your application
