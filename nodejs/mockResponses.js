/**
 * Mock responses for wallet management testing
 */

/**
 * Generate mock stored payment token
 */
export const generateMockStoredPaymentToken = () => {
    return `token_${Date.now()}_${Math.random().toString(36).substr(2, 16)}`;
};

/**
 * Get card details from mock stored payment token
 */
export const getCardDetailsFromToken = (storedPaymentToken) => {
    // Extract mock data from token pattern or use defaults for demo
    const mockDetails = {
        brand: 'Visa',
        last4: '0016',
        expiryMonth: '12',
        expiryYear: '28'
    };

    // If token contains identifiable patterns, use them
    const tokenLower = storedPaymentToken.toLowerCase();
    if (tokenLower.includes('visa')) {
        mockDetails.brand = 'Visa';
        mockDetails.last4 = '0016';
    } else if (tokenLower.includes('mastercard') || tokenLower.includes('mc')) {
        mockDetails.brand = 'Mastercard';
        mockDetails.last4 = '5780';
    } else if (tokenLower.includes('amex')) {
        mockDetails.brand = 'American Express';
        mockDetails.last4 = '1018';
    } else if (tokenLower.includes('discover')) {
        mockDetails.brand = 'Discover';
        mockDetails.last4 = '6527';
    }

    return mockDetails;
};