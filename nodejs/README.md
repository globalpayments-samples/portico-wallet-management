# Wallet Management - Node.js Implementation

A secure Node.js and Express.js wallet management system for storing and managing payment methods using Global Payments multi-use tokens. This implementation demonstrates wallet management capabilities without processing actual payments.

## Features

- **Multi-Use Token Creation** - Convert single-use tokens to secure stored payment tokens with customer data
- **Payment Method Management** - Add, view, edit, and manage stored payment methods
- **Mock Mode Testing** - Test functionality without live API credentials
- **JSON-Based Storage** - Simple file-based storage for demonstration
- **Comprehensive API** - RESTful endpoints for all wallet operations
- **Modern JavaScript** - ES6 modules with async/await patterns

## Requirements

- **Node.js** 18.x or higher
- **npm** 8.x or higher

## Setup

### 1. Navigate to Node.js Directory

```bash
cd nodejs
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

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Server

```bash
./run.sh
```

The server will start on `http://localhost:8000`

Alternatively, manually start the server:

```bash
npm start
```

### 5. Access the Web Interface

Open your browser and navigate to:

```
http://localhost:8000
```

## Project Structure

```
nodejs/
├── README.md                # This file
├── .env.sample             # Environment configuration template
├── .env                    # Your credentials (create from .env.sample)
├── package.json            # npm dependencies
├── run.sh                  # Quick start script
├── server.js               # Express server and routes
├── jsonStorage.js          # JSON storage implementation
├── paymentUtils.js         # Payment utility functions
├── mockResponses.js        # Mock data generator
└── data/                   # Storage directory
    ├── payment-methods.json # Saved payment methods
    └── config.json         # Mock mode configuration
```

## API Endpoints

### System Endpoints

#### GET `/health`

Check system health and configuration status.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-10-22T10:30:00Z",
    "service": "wallet-management-nodejs",
    "version": "1.0.0",
    "sdkStatus": "configured",
    "mockMode": false
  },
  "message": "System is healthy"
}
```

#### GET `/config`

Get public API key for frontend SDK initialization.

**Response:**
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

#### GET `/payment-methods`

List all saved payment methods.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "pm_550e8400",
      "type": "card",
      "brand": "Visa",
      "last4": "4242",
      "expiry": "12/2028",
      "nickname": "Personal Visa",
      "isDefault": true,
      "createdAt": "2025-10-22T10:00:00Z",
      "updatedAt": "2025-10-22T10:00:00Z"
    }
  ],
  "message": "Payment methods retrieved successfully"
}
```

#### POST `/payment-methods`

Create a new payment method or edit an existing one.

**Create New Payment Method:**

Request body:
```json
{
  "paymentToken": "supt_abc123xyz789",
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

Response:
```json
{
  "success": true,
  "data": {
    "id": "pm_550e8400",
    "type": "card",
    "brand": "Visa",
    "last4": "4242",
    "expiry": "12/2028",
    "nickname": "Personal Visa",
    "isDefault": true
  },
  "message": "Payment method created and saved successfully"
}
```

**Edit Existing Payment Method:**

Request body:
```json
{
  "id": "pm_550e8400",
  "nickname": "Updated Nickname",
  "isDefault": true
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "pm_550e8400",
    "type": "card",
    "brand": "Visa",
    "last4": "4242",
    "expiry": "12/2028",
    "nickname": "Updated Nickname",
    "isDefault": true
  },
  "message": "Payment method updated successfully"
}
```

### Mock Mode Management

#### GET `/mock-mode`

Get current mock mode status.

**Response:**
```json
{
  "success": true,
  "data": {
    "isEnabled": false
  },
  "message": "Mock mode is disabled"
}
```

#### POST `/mock-mode`

Toggle mock mode on or off.

**Request:**
```json
{
  "isEnabled": true
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isEnabled": true
  },
  "message": "Mock mode enabled successfully"
}
```

## How It Works

### Token Flow

1. **Frontend Token Collection**
   - Customer enters card details in Heartland Hosted Fields
   - Heartland securely tokenizes the card data
   - Single-use token (e.g., `supt_...`) is returned to frontend
   - Frontend sends token to your backend

2. **Multi-Use Token Creation**
   - Backend receives single-use token + customer data + card details
   - System calls Global Payments API to exchange for multi-use token
   - API associates customer billing information with the token
   - Multi-use token (e.g., `token_...`) is returned

3. **Secure Storage**
   - Payment method metadata is stored in JSON file
   - Stored data: multi-use token, brand, last4, expiry, nickname, default status
   - No sensitive card data (CVV, full PAN) is ever stored

4. **Retrieval & Management**
   - List all payment methods via GET endpoint
   - Edit nicknames and default preferences via POST endpoint
   - Stored payment tokens can be used for future payment processing (not implemented here)

### Multi-Use Token Creation with Customer Data

The system creates multi-use tokens using the Global Payments SDK:

```javascript
async function createMultiUseTokenWithCustomer(paymentToken, customerData) {
  const customer = new Customer();
  customer.firstName = customerData.firstName;
  customer.lastName = customerData.lastName;
  customer.email = customerData.email;

  const address = new Address();
  address.streetAddress1 = customerData.address;
  address.city = customerData.city;
  address.state = customerData.state;
  address.postalCode = customerData.zip;
  customer.address = address;

  return await customer.create();
}
```

This creates a multi-use token that:
- Can be reused for multiple transactions
- Includes associated customer billing information
- Provides better reporting and reconciliation
- Enables customer-specific payment workflows

### Mock Mode vs Live Mode

**Mock Mode** (enabled via `/mock-mode` endpoint):
- Simulates API responses without calling real API
- Uses test card patterns (Visa 4242, Mastercard 5454, etc.)
- Perfect for development and testing without credentials
- Persists across server restarts via `data/config.json`

**Live Mode** (requires valid API credentials):
- Calls actual Global Payments API endpoints
- Creates real multi-use stored payment tokens
- Requires valid `SECRET_API_KEY` in `.env` file
- Falls back to mock mode if API calls fail

### Storage Implementation

The system uses JSON file storage for simplicity:

- `data/payment-methods.json` - Stores payment method metadata
- `data/config.json` - Stores mock mode preference
- Atomic file operations for data consistency
- Automatic directory creation on first run

**Production Note:** Replace JSON storage with database (MongoDB, PostgreSQL, Redis) for production use.

## Configuration

### Environment Variables

Create `.env` file with the following variables:

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PUBLIC_API_KEY` | Global Payments public API key | No (for mock mode) | None |
| `SECRET_API_KEY` | Global Payments secret API key | No (for mock mode) | None |
| `PORT` | Server port number | No | 8000 |

### SDK Configuration

The SDK is configured to use the Heartland certification environment:

```javascript
const config = new PorticoConfig();
config.secretApiKey = process.env.SECRET_API_KEY;
config.serviceUrl = 'https://cert.api2.heartlandportico.com';
ServicesContainer.configureService(config);
```

For production, update the `serviceUrl` to the production endpoint.

## Troubleshooting

### Common Issues

**Issue:** "Node.js version too old"
```bash
# Update Node.js
nvm install 18
nvm use 18
# Or download from nodejs.org
```

**Issue:** "npm install fails"
```bash
# Clear npm cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Issue:** "Port 8000 already in use"
```bash
# Use a different port
PORT=8080 npm start
```

**Issue:** "SDK configuration failed"
- Check that `.env` file exists and contains valid credentials
- Or enable mock mode for testing without credentials
- Verify credentials at [developer.globalpay.com](https://developer.globalpay.com)

**Issue:** "Multi-use token creation failed"
- Verify `SECRET_API_KEY` is correct
- Check that customer data includes required fields (firstName, lastName, email)
- Enable mock mode for testing: `POST /mock-mode {"isEnabled": true}`

**Issue:** "Payment methods not persisting"
- Check `data/` directory exists and is writable
- Verify JSON files are not corrupted
- Check server logs for file write errors

### Debug Mode

Enable debug logging:

```bash
DEBUG=* npm start
```

Or for Express only:

```bash
DEBUG=express:* npm start
```

## Security

### Development vs Production

This implementation is designed for **development and demonstration**. For production deployment:

1. **Database Storage**
   - Replace JSON files with MongoDB, PostgreSQL, or Redis
   - Implement proper connection pooling
   - Add data backup and recovery

2. **Authentication**
   - Implement user authentication (JWT, OAuth, session)
   - Add authorization middleware on all endpoints
   - Ensure users can only access their own payment methods

3. **API Security**
   - Enable HTTPS/TLS encryption
   - Implement rate limiting (express-rate-limit)
   - Add CORS restrictions (currently allows all origins)
   - Use helmet.js for security headers

4. **Input Validation**
   - Add input validation library (joi, express-validator)
   - Sanitize all user inputs
   - Validate content-type headers
   - Implement request size limits

5. **Error Handling**
   - Disable stack traces in production
   - Implement structured logging (winston, pino)
   - Set up error monitoring (Sentry, New Relic)
   - Use proper HTTP status codes

6. **Process Management**
   - Use PM2 for process management
   - Enable cluster mode for multi-core usage
   - Set up health check endpoints
   - Configure auto-restart on crashes

### Sensitive Data Handling

- Card data never touches your servers (Heartland Hosted Fields handles tokenization)
- Store only stored payment tokens, not card numbers
- Never log or display full card numbers
- Environment variables for API credentials
- Secure transmission (HTTPS in production)

## Testing

### Manual Testing with cURL

**Health Check:**
```bash
curl http://localhost:8000/health
```

**Enable Mock Mode:**
```bash
curl -X POST http://localhost:8000/mock-mode \
  -H "Content-Type: application/json" \
  -d '{"isEnabled": true}'
```

**Add Payment Method (Mock Mode):**
```bash
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

### Integration Testing

Use the included web interface at `http://localhost:8000` for comprehensive testing:

1. Enable mock mode via the UI
2. Add test payment methods
3. Edit nicknames and default status
4. Verify data persists across page reloads
5. Test with live credentials (disable mock mode)

## Dependencies

- **globalpayments-api** (latest) - Global Payments Node.js SDK
- **express** (latest) - Web application framework
- **dotenv** (latest) - Environment variable management
- **cors** (latest) - CORS middleware

## Next Steps

1. Explore the web interface at `http://localhost:8000`
2. Review the API endpoints and test with mock mode
3. Integrate wallet management into your application
4. Build payment processing on top of stored payment methods
5. Implement user authentication and database storage for production

## Support

- **Global Payments Documentation:** [developer.globalpay.com/docs](https://developer.globalpay.com/docs)
- **Node.js SDK Documentation:** [github.com/globalpayments/node-sdk](https://github.com/globalpayments/node-sdk)
- **API Reference:** [developer.globalpay.com/api](https://developer.globalpay.com/api)

## License

MIT License - See LICENSE file for details.
