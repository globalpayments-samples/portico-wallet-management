<?php

declare(strict_types=1);

/**
 * Mock responses for testing without SDK
 */
class MockResponses
{
    /**
     * Generate mock stored payment token response
     */
    public static function getStoredPaymentToken(array $cardData): array
    {
        return [
            'id' => 'stored_' . uniqid() . '_' . bin2hex(random_bytes(8)),
            'brand' => $cardData['brand'],
            'last4' => $cardData['last4'],
            'exp_month' => $cardData['exp_month'],
            'exp_year' => $cardData['exp_year'],
            'created_at' => date('c'),
            'type' => 'card'
        ];
    }

    /**
     * Get card details from mock stored payment token
     */
    public static function getCardDetailsFromToken(string $storedPaymentToken): array
    {
        // Extract mock data from token pattern or use defaults for demo
        $mockDetails = [
            'brand' => 'Visa',
            'last4' => '0016',
            'expiryMonth' => '12',
            'expiryYear' => '28'
        ];

        // If token contains identifiable patterns, use them
        if (strpos($storedPaymentToken, 'visa') !== false) {
            $mockDetails['brand'] = 'Visa';
            $mockDetails['last4'] = '0016';
        } elseif (strpos($storedPaymentToken, 'mastercard') !== false || strpos($storedPaymentToken, 'mc') !== false) {
            $mockDetails['brand'] = 'Mastercard';
            $mockDetails['last4'] = '5780';
        } elseif (strpos($storedPaymentToken, 'amex') !== false) {
            $mockDetails['brand'] = 'American Express';
            $mockDetails['last4'] = '1018';
        } elseif (strpos($storedPaymentToken, 'discover') !== false) {
            $mockDetails['brand'] = 'Discover';
            $mockDetails['last4'] = '6527';
        }

        return $mockDetails;
    }

}