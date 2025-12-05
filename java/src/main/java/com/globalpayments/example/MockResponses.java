package com.globalpayments.example;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Mock responses for wallet management testing
 */
public class MockResponses {

    /**
     * Generate mock stored payment token
     */
    public static String generateMockStoredPaymentToken() {
        return "token_" + UUID.randomUUID().toString().replace("-", "");
    }
    
    /**
     * Get card details from mock stored payment token
     */
    public static Map<String, String> getCardDetailsFromToken(String storedPaymentToken) {
        Map<String, String> mockDetails = new HashMap<>();
        
        // Default mock data
        mockDetails.put("brand", "Visa");
        mockDetails.put("last4", "0016");
        mockDetails.put("expiryMonth", "12");
        mockDetails.put("expiryYear", "28");

        // If token contains identifiable patterns, use them
        String tokenLower = storedPaymentToken.toLowerCase();
        if (tokenLower.contains("visa")) {
            mockDetails.put("brand", "Visa");
            mockDetails.put("last4", "0016");
        } else if (tokenLower.contains("mastercard") || tokenLower.contains("mc")) {
            mockDetails.put("brand", "Mastercard");
            mockDetails.put("last4", "5780");
        } else if (tokenLower.contains("amex")) {
            mockDetails.put("brand", "American Express");
            mockDetails.put("last4", "1018");
        } else if (tokenLower.contains("discover")) {
            mockDetails.put("brand", "Discover");
            mockDetails.put("last4", "6527");
        }

        return mockDetails;
    }
}