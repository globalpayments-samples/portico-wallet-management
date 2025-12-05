# Wallet Management - Java Implementation

A secure Java-based wallet management system for storing and managing payment methods using Global Payments multi-use tokens. Built with Jakarta EE and Maven, this implementation demonstrates wallet management capabilities without processing actual payments.

## Features

- **Multi-Use Token Creation** - Convert single-use tokens to secure stored payment tokens with customer data
- **Payment Method Management** - Add, view, edit, and manage stored payment methods
- **Mock Mode Testing** - Test functionality without live API credentials
- **JSON-Based Storage** - Simple file-based storage for demonstration
- **Servlet Architecture** - Jakarta EE servlets with embedded Tomcat
- **Thread-Safe** - Concurrent request handling with proper synchronization

## Requirements

- **Java** 23 or higher (configured for Java 23, works with 11+)
- **Maven** 3.6 or higher

## Setup

### 1. Navigate to Java Directory

```bash
cd java
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
- Clean any previous builds
- Compile the project
- Package as WAR file
- Start embedded Tomcat on `http://localhost:8000`

Alternatively, manually run:

```bash
mvn clean package cargo:run
```

### 4. Access the Web Interface

Open your browser and navigate to:

```
http://localhost:8000
```

## Project Structure

```
java/
├── README.md                    # This file
├── .env.sample                  # Environment configuration template
├── .env                         # Your credentials
├── pom.xml                      # Maven configuration
├── run.sh                       # Quick start script
├── src/main/java/com/globalpayments/vault/
│   ├── HealthServlet.java       # Health check endpoint
│   ├── ConfigServlet.java       # Configuration endpoint
│   ├── PaymentMethodsServlet.java # Payment methods CRUD
│   ├── MockModeServlet.java     # Mock mode toggle
│   ├── PaymentUtils.java        # Payment utilities
│   ├── JsonStorage.java         # Storage implementation
│   └── MockResponses.java       # Mock data generator
└── data/                        # Storage directory
    ├── payment-methods.json     # Saved payment methods
    └── config.json              # Mock mode configuration
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

### Servlet Architecture

The Java implementation uses Jakarta EE servlets with embedded Tomcat:

1. **Request Routing** - Each endpoint has a dedicated servlet
2. **Thread Safety** - Synchronized access to JSON storage
3. **Configuration** - dotenv-java loads environment variables
4. **SDK Integration** - Global Payments Java SDK for tokenization

### Multi-Use Token Creation

```java
public static TransactionResult createMultiUseTokenWithCustomer(
    String paymentToken,
    CustomerData customerData
) throws ApiException {
    Customer customer = new Customer();
    customer.setFirstName(customerData.getFirstName());
    customer.setLastName(customerData.getLastName());
    customer.setEmail(customerData.getEmail());

    Address address = new Address();
    address.setStreetAddress1(customerData.getAddress());
    address.setCity(customerData.getCity());
    address.setState(customerData.getState());
    address.setPostalCode(customerData.getZip());
    customer.setAddress(address);

    return customer.create();
}
```

## Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PUBLIC_API_KEY` | Global Payments public API key | No (for mock mode) | None |
| `SECRET_API_KEY` | Global Payments secret API key | No (for mock mode) | None |

### Maven Configuration

Key settings in `pom.xml`:

```xml
<properties>
    <maven.compiler.source>23</maven.compiler.source>
    <maven.compiler.target>23</maven.compiler.target>
</properties>

<dependencies>
    <dependency>
        <groupId>com.heartlandpaymentsystems</groupId>
        <artifactId>globalpayments-sdk</artifactId>
        <version>14.2.20</version>
    </dependency>
    <dependency>
        <groupId>io.github.cdimascio</groupId>
        <artifactId>dotenv-java</artifactId>
        <version>3.0.0</version>
    </dependency>
    <dependency>
        <groupId>jakarta.servlet</groupId>
        <artifactId>jakarta.servlet-api</artifactId>
        <version>5.0.0</version>
        <scope>provided</scope>
    </dependency>
</dependencies>
```

### Cargo Plugin

Embedded Tomcat 10 configuration:

```xml
<plugin>
    <groupId>org.codehaus.cargo</groupId>
    <artifactId>cargo-maven3-plugin</artifactId>
    <version>1.10.10</version>
    <configuration>
        <container>
            <containerId>tomcat10x</containerId>
            <type>embedded</type>
        </container>
        <configuration>
            <properties>
                <cargo.servlet.port>8000</cargo.servlet.port>
            </properties>
        </configuration>
    </configuration>
</plugin>
```

## Troubleshooting

### Common Issues

**Issue:** "Java version mismatch"
```bash
# Check Java version
java -version
# Should be 11 or higher

# Set JAVA_HOME
export JAVA_HOME=/path/to/java
```

**Issue:** "Maven build fails"
```bash
# Clean and rebuild
mvn clean install
# Or skip tests
mvn clean install -DskipTests
```

**Issue:** "Port 8000 already in use"
```bash
# Edit pom.xml and change port
<cargo.servlet.port>8080</cargo.servlet.port>
```

**Issue:** "SDK configuration failed"
- Verify `.env` file exists with valid credentials
- Check console logs for initialization errors
- Enable mock mode for testing without credentials

**Issue:** "Servlet initialization fails"
- Check for missing dependencies: `mvn dependency:tree`
- Verify Jakarta Servlet API version compatibility
- Check servlet mappings in code

## Security

### Production Deployment

For production use, implement:

1. **Database Storage** - Replace JSON with JPA/Hibernate + PostgreSQL/MySQL
2. **Authentication** - Add Spring Security or Jakarta Security
3. **Connection Pooling** - Configure HikariCP or C3P0
4. **HTTPS** - Enable TLS/SSL encryption
5. **Input Validation** - Add validation framework (Hibernate Validator)
6. **Logging** - Implement SLF4J with Logback
7. **Monitoring** - Add JMX metrics and APM tools
8. **Container Security** - Harden Tomcat configuration

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

- **globalpayments-sdk** (14.2.20) - Global Payments Java SDK
- **dotenv-java** (3.0.0) - Environment variable management
- **jakarta.servlet-api** (5.0.0) - Servlet API

## Next Steps

1. Explore the web interface at `http://localhost:8000`
2. Test with mock mode enabled
3. Integrate wallet management into your Java application
4. Consider migration to Spring Boot for production
5. Implement database storage and user authentication

## Support

- **Global Payments Documentation:** [developer.globalpay.com/docs](https://developer.globalpay.com/docs)
- **Java SDK Documentation:** [github.com/globalpayments/java-sdk](https://github.com/globalpayments/java-sdk)
- **API Reference:** [developer.globalpay.com/api](https://developer.globalpay.com/api)

## License

MIT License - See LICENSE file for details.
