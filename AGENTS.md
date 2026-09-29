# Global Payments Portico Wallet Management

> Save cards to a customer wallet by turning a single-use hosted fields token into a Portico multi-use token, with JSON file storage, demonstrated in PHP, Node.js, Java, .NET, and Go.

## Critical Patterns

1. **This is a Portico repo: `PorticoConfig` with `SECRET_API_KEY`, not GP-API.** Every backend configures `PorticoConfig` with `SECRET_API_KEY`, `developerId "000000"`, `versionNumber "0000"` and a hardcoded `serviceUrl` of `https://cert.api2.heartlandportico.com`. There is no environment switch, so pointing at production means editing the service URL in every language. The browser side uses `PUBLIC_API_KEY` (returned by `GET /config`) with `GlobalPayments.configure({ publicApiKey })`. Node.js configures the SDK in `configureGlobalPaymentsSDK()` in `server.js`, which omits `developerId` and `versionNumber`; the fuller `configureSdk()` in `paymentUtils.js` is never called.

2. **The multi-use token comes from a Verify with `withRequestMultiUseToken(true)`, never a Charge.** PHP, Node.js, Java and .NET call `card.verify()` with currency `USD`, `withRequestMultiUseToken(true)` and the billing address inside `createMultiUseTokenWithCustomer()` / `CreateMultiUseTokenWithCustomerAsync()`, and treat response code `00` as success. Go is different: `createMultiUseTokenWithCustomer()` in `go/paymentUtils.go` calls `card.Tokenize()` with no address. The wallet never moves money. If the gateway returns no token, every language quietly keeps the original single-use token.

3. **A failed live token call falls back to mock data instead of returning an error.** If multi-use token creation throws, all five backends save the single-use token with card details taken from the request or from mock data, and still return `success: true`. PHP, Node.js, Java and .NET set `mockMode: true` in that response. Go does not: `createPaymentMethodFromToken()` reports the global flag, so a failed live call comes back looking like a real save. In .NET the fallback in `HandleCreatePaymentMethodMultiUse()` sets the global `mockModeEnabled = true`, so one failure switches the whole process into mock mode until it restarts or `POST /mock-mode` turns it off. With no `SECRET_API_KEY`, PHP, .NET and Go save mock data with `mockMode: false`, Node.js attempts the live call anyway and falls back, and Java returns 503 `CONFIGURATION_ERROR`.

4. **The `POST /payment-methods` request shape is not the same in every language.** PHP, .NET and Go expect a flat body: `payment_token`, `cardDetails`, and snake_case customer fields (`first_name`, `street_address`, `billing_zip`, ...). Node.js and Java expect `paymentToken` plus a nested `customerData` object, and their bundled `index.html` sends it with camelCase keys (`firstName`, `streetAddress`, `billingZip`). Their helpers read snake_case keys (`street_address`, `billing_zip`; Java's `CustomerData` also reads `first_name` and `last_name`), so street address and ZIP reach the Verify empty in Node.js and Java. City, state and country do get through. Check each backend before you reuse a frontend across languages.

## Repository Structure

### PHP (built-in server + Global Payments SDK)
- [`php/router.php`](php/router.php): built-in server router; serves `index.html` and static files, sends API paths to `index.php`
- [`php/index.php`](php/index.php): switch that dispatches `health`, `config`, `payment-methods` and `mock-mode` to their files
- [`php/PaymentUtils.php`](php/PaymentUtils.php): `configureSdk()`, `createMultiUseTokenWithCustomer()`, `getCardDetailsFromToken()`, `sendSuccessResponse()`, `sendErrorResponse()`
- [`php/payment-methods.php`](php/payment-methods.php): GET list, POST create or edit (edit when `id` is present)
- [`php/mock-mode.php`](php/mock-mode.php): `MockModeConfig` class, persisted to `data/mock_mode_config.json`
- [`php/JsonStorage.php`](php/JsonStorage.php): `data/payment_methods.json` read, add, update, validate
- [`php/MockResponses.php`](php/MockResponses.php), [`php/config.php`](php/config.php), [`php/health.php`](php/health.php)

### Node.js (Express + Global Payments SDK)
- [`nodejs/server.js`](nodejs/server.js): all routes; `handleCreatePaymentMethod()`, `handleEditPaymentMethod()`, `configureGlobalPaymentsSDK()`, `startServer()`
- [`nodejs/paymentUtils.js`](nodejs/paymentUtils.js): `createMultiUseTokenWithCustomer()`, `getCardDetailsFromToken()`, `determineCardBrandFromType()`; `createStoredPaymentTokenWithSDK()` (raw card number) is not used by any route
- [`nodejs/jsonStorage.js`](nodejs/jsonStorage.js): payment methods plus `loadMockModeConfig()` / `saveMockModeConfig()` in `data/`
- [`nodejs/mockResponses.js`](nodejs/mockResponses.js), [`nodejs/index.html`](nodejs/index.html)

### Java (Jakarta Servlet + Global Payments SDK)
- [`java/src/main/java/com/globalpayments/example/PaymentMethodsServlet.java`](java/src/main/java/com/globalpayments/example/PaymentMethodsServlet.java): `doGet`, `doPost`, `handleEditPaymentMethod()`
- [`java/src/main/java/com/globalpayments/example/PaymentUtils.java`](java/src/main/java/com/globalpayments/example/PaymentUtils.java): `configureSdk()`, `createMultiUseTokenWithCustomer()`, `getCardDetailsFromToken()`, `CustomerData` / `CardDetails` holders
- [`java/src/main/java/com/globalpayments/example/MockModeServlet.java`](java/src/main/java/com/globalpayments/example/MockModeServlet.java): mock mode is a static field held in memory, not persisted
- `ConfigServlet.java`, `HealthServlet.java`, `JsonStorage.java`, `MockResponses.java` in the same package
- [`java/src/main/webapp/index.html`](java/src/main/webapp/index.html)

### .NET (ASP.NET Core minimal API + Global Payments SDK)
- [`dotnet/Program.cs`](dotnet/Program.cs): `ConfigureGlobalPaymentsSDK()`, `ConfigureEndpoints()`, `HandleCreatePaymentMethodMultiUse()`, `HandleEditPaymentMethodPhpStyle()`; mock mode is a static field held in memory
- [`dotnet/PaymentUtils.cs`](dotnet/PaymentUtils.cs): `CreateMultiUseTokenWithCustomerAsync()`, `GetCardDetailsFromTokenAsync()`
- [`dotnet/Models.cs`](dotnet/Models.cs): request models with `[JsonPropertyName]` snake_case mappings
- [`dotnet/JsonStorage.cs`](dotnet/JsonStorage.cs), [`dotnet/wwwroot/index.html`](dotnet/wwwroot/index.html)

### Go (gorilla/mux + Global Payments Go SDK)
- [`go/main.go`](go/main.go): router setup in `main()`, `getEnv()`; serves `static/index.html` at `/`
- [`go/handlers.go`](go/handlers.go): `healthHandler`, `configHandler`, `mockModeHandler`, `paymentMethodsHandler`
- [`go/paymentUtils.go`](go/paymentUtils.go): `initializeSDK()`, `createPaymentMethod()`, `createPaymentMethodFromToken()`, `createMultiUseTokenWithCustomer()`; the legacy `createPaymentMethodFromCardData()` path still accepts a raw `cardNumber`
- [`go/jsonStorage.go`](go/jsonStorage.go) (mock mode persisted to `data/mock_mode_config.json`), [`go/types.go`](go/types.go), [`go/static/index.html`](go/static/index.html)

### Shared
- [`docker-compose.yml`](docker-compose.yml): six services plus a `tests` profile. It is broken as committed: it defines a `python` service with no `python/` folder, and the `tests` service builds `Dockerfile.tests`, which copies `tests/` and `playwright.config.js`. Neither exists.
- [`index.html`](index.html): leftover template, not served by any backend. Its form posts to `/process-payment.php` and it has a broken stylesheet URL (`styles.csscss/styles.css`)
- [`docker-run.sh`](docker-run.sh), [`Dockerfile.tests`](Dockerfile.tests), [`package.json`](package.json) (root script runs `node nodejs/server.js`)

## API Surface

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/health` | Health check; the payload differs by language |
| GET | `/config` | Returns `publicApiKey` for hosted fields (Node.js, Java, .NET and Go fall back to `pk_test_demo_key`, PHP to an empty string) |
| GET | `/payment-methods` | Lists saved payment methods (id, brand, last4, expiry, nickname, isDefault) |
| POST | `/payment-methods` | Creates a payment method from a single-use token, or edits `nickname` / `isDefault` when `id` is present |
| GET | `/mock-mode` | Returns `{ isEnabled }` |
| POST | `/mock-mode` | Sets mock mode; body `{ "isEnabled": true }` (must be boolean) |

All five backends register the same six routes, and every response uses the envelope `{ success, data, message, timestamp }`. `go/static/index.html` also has a charge button that calls `POST /charge`. No backend has that route, so it returns 404.

## Environment Variables

```bash
PUBLIC_API_KEY=your_public_key   # Portico public key, sent to the browser by GET /config
SECRET_API_KEY=your_secret_key   # Portico secret key for PorticoConfig; if empty, most languages use mock data
PORT=8000                        # Optional; honored by Node.js, .NET, Go and php/run.sh. Java is fixed by cargo.servlet.port
```

Every language directory has a `.env.sample` with only `PUBLIC_API_KEY` and `SECRET_API_KEY`. Copy it to `.env` in that directory. `APP_ENV` shows up only as an informational value in PHP `/health` and Go's startup log.

## Test Cards

| Brand | Number | CVV | Expiry |
|-------|--------|-----|--------|
| Visa | 4012002000060016 | 123 | Any future date |
| Mastercard | 5473500000000014 | 123 | Any future date |

The test-card dropdown in each `index.html` also offers 2223000010005780, 6011000990156527, 372700699251018 and 3566007770007321. The READMEs use `4242` sample values that do not match the UI list. Get Portico sandbox keys at [developer.globalpay.com](https://developer.globalpay.com).

## Architecture Summary

**Save card:** hosted fields (`js.globalpay.com/v1/globalpayments.js`, `publicApiKey` from `/config`) -> single-use token -> `POST /payment-methods` -> Verify with `withRequestMultiUseToken(true)` (Go: Tokenize) -> multi-use token plus brand, last4 and expiry from `cardDetails` -> appended to `data/payment_methods.json`

**Manage:** `GET /payment-methods` reads the JSON file; `POST /payment-methods` with `id` updates only `nickname` and `isDefault`. Setting a new default clears the others.

**Mock mode:** persisted to `data/mock_mode_config.json` in PHP, Node.js and Go; held in memory in Java and .NET, where it resets to off on restart.

## Security Notes

No endpoint has authentication. CORS allows `*`, and tokens and customer data sit in plain JSON under `data/`. The Portico service URL is hardcoded to cert. Go still accepts raw card numbers through its legacy path, which puts the server in PCI scope. For production, remove that path, add auth, move storage to a real database, and stop falling back silently to mock data.

## How to Run

```bash
cd php && ./run.sh       # PHP: composer install, php -S 0.0.0.0:$PORT router.php (:8000)
cd nodejs && ./run.sh    # Node.js: npm install, npm start (:8000)
cd java && ./run.sh      # Java: mvn clean package cargo:run (:8000 from pom.xml)
cd dotnet && ./run.sh    # .NET: dotnet restore, dotnet run (:8000)
cd go && ./run.sh        # Go: go mod download, go run . (:8000)
```

`docker-compose up` fails as committed because of the missing `python` service. To use compose, start the existing services by name (`docker-compose up nodejs php java go dotnet`). They map to host ports 8001, 8003, 8004, 8005 and 8006. The compose file and `docker-run.sh` pass `PUBLIC_API_KEY` / `SECRET_API_KEY` from a root `.env`.

Saving a real card needs a browser, because the hosted fields iframe produces the single-use token. With curl alone you can only exercise mock mode.

## How to Verify

```bash
curl http://localhost:8000/health
# Expected: {"success":true,"data":{"status":"healthy",...},...}

curl http://localhost:8000/config
# Expected: {"success":true,"data":{"publicApiKey":"pkapi_..."},...}

curl -X POST http://localhost:8000/mock-mode -H "Content-Type: application/json" -d '{"isEnabled":true}'
# Expected: {"success":true,"data":{"isEnabled":true},"message":"Mock mode enabled successfully",...} (Go omits "successfully")

# Create (PHP, .NET, Go body shape; Node.js and Java need paymentToken + customerData instead)
curl -X POST http://localhost:8000/payment-methods -H "Content-Type: application/json" \
  -d '{"payment_token":"supt_test","cardDetails":{"cardType":"visa","cardLast4":"0016","expiryMonth":"12","expiryYear":"2028"},"first_name":"Jane","last_name":"Doe","billing_zip":"12345","nickname":"Test Visa"}'
# Expected: {"success":true,"data":{"id":"pm_...","brand":"Visa","last4":"0016","mockMode":true,...},...}

curl http://localhost:8000/payment-methods
# Expected: {"success":true,"data":[{"id":"pm_...","type":"card","last4":"0016",...}],...}

# Edit
curl -X POST http://localhost:8000/payment-methods -H "Content-Type: application/json" -d '{"id":"pm_...","nickname":"Renamed","isDefault":true}'
```

## Making Changes

All five backends are supposed to behave the same. Apply a change to every language, one commit per language, and use the same pass to fix the request-shape drift described in Critical Pattern 4. Each language serves its own copy of the frontend (`php/index.html`, `nodejs/index.html`, `java/src/main/webapp/index.html`, `dotnet/wwwroot/index.html`, `go/static/index.html`). The copies are not identical, so check all five when you change the UI. Do not edit `docker-compose.yml` or `docker-run.sh` without checking every service. There is no Python implementation, so do not add one without explicit instruction.

## SDK Versions

- **PHP**: `globalpayments/php-sdk` ^13.1, `vlucas/phpdotenv` ^5.5
- **Node.js**: `globalpayments-api` ^3.10.6, `express` ^4.18.2
- **Java**: `globalpayments-sdk` (com.heartlandpaymentsystems) 14.2.20, Jakarta Servlet 5.0.0
- **.NET**: `GlobalPayments.Api` 9.0.16, `DotEnv.Net` 3.2.1, net9.0
- **Go**: `github.com/globalpayments/go-sdk` v1.1.3, `gorilla/mux` v1.8.1, go 1.23.4
