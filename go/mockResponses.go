package main

// getMockPaymentMethodResult generates mock responses for payment method creation
func getMockPaymentMethodResult(cardNumber, last4 string) (bool, string) {
	// Remove spaces from card number
	cleanCardNumber := cardNumber

	// Check for specific test scenarios based on card number
	switch cleanCardNumber {
	case "4000000000009995":
		return false, "Invalid card number"
	case "4000000000009987":
		return false, "Card declined by issuer"
	case "4000000000000002":
		return false, "Card declined - insufficient funds"
	default:
		// Most cards succeed in mock mode
		return true, "Payment method created successfully"
	}
}