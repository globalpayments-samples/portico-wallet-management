/**
 * Payment utility functions for Global Payments SDK
 */

import * as dotenv from 'dotenv';
import {
    ServicesContainer,
    PorticoConfig,
    Address,
    CreditCardData,
    ApiError
} from 'globalpayments-api';

// Load environment variables
dotenv.config();

let sdkConfigured = false;

/**
 * Configure the Global Payments SDK
 */
export const configureSdk = () => {
    if (!sdkConfigured) {
        const config = new PorticoConfig();
        config.secretApiKey = process.env.SECRET_API_KEY;
        config.developerId = '000000';
        config.versionNumber = '0000';
        config.serviceUrl = 'https://cert.api2.heartlandportico.com';
        
        ServicesContainer.configureService(config);
        sdkConfigured = true;
    }
};

/**
 * Sanitize postal code by removing invalid characters
 */
export const sanitizePostalCode = (postalCode) => {
    if (!postalCode) return '';
    
    const sanitized = postalCode.replace(/[^a-zA-Z0-9-]/g, '');
    return sanitized.slice(0, 10);
};

/**
 * Create stored payment token using Global Payments SDK
 */
export const createStoredPaymentTokenWithSDK = async (data) => {
    try {
        const card = new CreditCardData();
        card.number = data.cardNumber;
        card.expMonth = parseInt(data.expiryMonth);
        card.expYear = parseInt(data.expiryYear);
        card.cvn = data.cvv;
        
        if (data.billingAddress) {
            const address = new Address();
            address.streetAddress1 = data.billingAddress.street || '';
            address.city = data.billingAddress.city || '';
            address.state = data.billingAddress.state || '';
            address.postalCode = data.billingAddress.zip || '';
            address.country = data.billingAddress.country || 'US';
            card.cardHolderName = data.billingAddress.name || '';
        }

        const response = await card.tokenize().execute();
        
        if (response.responseCode === '00' && response.token) {
            // Log successful tokenization in live mode
            console.log(`🔑 PAYMENT METHOD CREATION - Attempting tokenization for card ending in ${data.cardNumber.slice(-4)}`);
            console.log(`   📅 Expiry: ${data.expiryMonth}/${data.expiryYear}`);
            console.log(`   👤 Nickname: ${data.nickname || 'None'}`);
            console.log(`   ⭐ Set as Default: ${data.isDefault || false}`);

            console.log('✅ 🟢 LIVE MODE - Payment Method Created Successfully:');
            console.log(`   ⏰ Timestamp: ${new Date().toISOString()}`);
            console.log(`   🔐 Stored Payment Token: ${response.token}`);
            console.log(`   🔢 Last 4: ${data.cardNumber.slice(-4)}`);
            console.log(`   📅 Expiry: ${data.expiryMonth}/${data.expiryYear}`);
            console.log(`   📛 Nickname: ${data.nickname || 'None'}`);
            console.log(`   ⭐ Default: ${data.isDefault || false}`);
            console.log('   📡 API Status: Connected & Working');

            return response.token;
        } else {
            // Log failed tokenization attempt
            console.log('❌ 🔴 LIVE MODE - Payment Method Creation Failed:');
            console.log(`   ⏰ Timestamp: ${new Date().toISOString()}`);
            console.log(`   🔢 Last 4: ${data.cardNumber.slice(-4)}`);
            console.log(`   📅 Expiry: ${data.expiryMonth}/${data.expiryYear}`);
            console.log(`   ❌ Error: ${response.responseMessage || 'Unknown error'}`);
            console.log('   📡 API Status: Connected but Declined');

            throw new Error(`Tokenization failed: ${response.responseMessage || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('SDK tokenization error:', error.message);
        throw error;
    }
};

/**
 * Get card details from stored payment token using Global Payments SDK
 */
export const getCardDetailsFromToken = async (storedPaymentToken) => {
    try {
        const card = new CreditCardData();
        card.token = storedPaymentToken;
        
        // Use a $0.01 verify to get card details without charging
        const response = await card.verify()
            .withCurrency('USD')
            .execute();
        
        if (response.responseCode === '00') {
            // Extract card details from the response
            const cardBrand = determineCardBrandFromType(response.cardType || '');
            const last4 = response.cardLast4 || '';
            const expiryMonth = String(response.cardExpMonth || '').padStart(2, '0');
            const expiryYear = String(response.cardExpYear || '').slice(-2);

            return {
                brand: cardBrand,
                last4: last4,
                expiryMonth: expiryMonth,
                expiryYear: expiryYear,
                token: storedPaymentToken
            };
        } else {
            throw new Error(`Token verification failed: ${response.responseMessage || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('SDK token lookup error:', error.message);
        throw error;
    }
};

/**
 * Determine card brand from Global Payments card type
 */
export const determineCardBrandFromType = (cardType) => {
    const type = cardType.toLowerCase();
    
    switch (type) {
        case 'visa':
            return 'Visa';
        case 'mastercard':
        case 'mc':
            return 'Mastercard';
        case 'amex':
        case 'americanexpress':
            return 'American Express';
        case 'discover':
            return 'Discover';
        case 'jcb':
            return 'JCB';
        default:
            return 'Unknown';
    }
};

/**
 * Create multi-use token with customer data using Global Payments SDK
 */
export const createMultiUseTokenWithCustomer = async (paymentToken, customerData, cardDetails) => {
    try {
        const card = new CreditCardData();
        card.token = paymentToken;

        // Create address from customer data
        const address = new Address();
        address.streetAddress1 = (customerData.street_address || '').trim();
        address.city = (customerData.city || '').trim();
        address.state = (customerData.state || '').trim();
        address.postalCode = sanitizePostalCode(customerData.billing_zip || '');
        address.country = (customerData.country || '').trim();

        // Verify and request multi-use token
        const response = await card.verify(0.01)
            .withCurrency('USD')
            .withRequestMultiUseToken(true)
            .withAddress(address)
            .execute();

        if (response.responseCode === '00') {
            const brand = determineCardBrandFromType(cardDetails.cardType || '');
            const finalToken = response.token || paymentToken;

            console.log('Multi-use token created successfully');
            console.log(`Card Brand: ${brand}`);
            console.log(`Last 4: ${cardDetails.cardLast4 || ''}`);

            return {
                multiUseToken: finalToken,
                brand: brand,
                last4: cardDetails.cardLast4 || '',
                expiryMonth: cardDetails.expiryMonth || '',
                expiryYear: cardDetails.expiryYear || '',
                customerData: customerData
            };
        } else {
            throw new Error(`Multi-use token creation failed: ${response.responseMessage || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Multi-use token creation error:', error.message);
        throw error;
    }
};

